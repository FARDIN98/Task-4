const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create a new user
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, status, registration_time',
        [name, email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await pool.query(
      'SELECT id, name, email, status, last_login, registration_time FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Get all users (for admin panel)
  static async findAll() {
    const result = await pool.query(`
      SELECT id, name, email, status, last_login, registration_time 
      FROM users 
      ORDER BY last_login DESC NULLS LAST, registration_time DESC
    `);
    return result.rows;
  }

  // Update user status (block/unblock)
  static async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, status',
      [status, id]
    );
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Update last login time
  static async updateLastLogin(id) {
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Block multiple users
  static async blockUsers(userIds) {
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = ANY($2) RETURNING id, name, email, status',
      ['blocked', userIds]
    );
    return result.rows;
  }

  // Delete multiple users
  static async deleteUsers(userIds) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = ANY($1) RETURNING id',
      [userIds]
    );
    return result.rows;
  }
}

module.exports = UserModel;