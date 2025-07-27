const supabase = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Common fields for user selection
  static USER_SELECT_FIELDS = 'id, name, email, status, last_login, registration_time';
  static USER_PUBLIC_FIELDS = 'id, name, email, status';

  // Helper method for handling Supabase errors
  static handleSupabaseError(error, customMessage = null) {
    if (error && error.code !== 'PGRST116') {
      throw customMessage ? new Error(customMessage) : error;
    }
  }

  // Helper method for timestamp
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            name,
            email,
            password: hashedPassword,
            status: 'active',
            registration_time: this.getCurrentTimestamp()
          }
        ])
        .select(this.USER_SELECT_FIELDS)
        .single();

      if (error) {
        if (error.code === '23505' || error.message.includes('duplicate key')) {
          throw new Error('Email already exists');
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      if (error.message === 'Email already exists') {
        throw error;
      }
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    this.handleSupabaseError(error);
    return data;
  }

  // Find user by ID
  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select(this.USER_SELECT_FIELDS)
      .eq('id', id)
      .single();

    this.handleSupabaseError(error);
    return data;
  }

  // Get all users (for admin panel)
  static async findAll() {
    const { data, error } = await supabase
      .from('users')
      .select(this.USER_SELECT_FIELDS)
      .order('last_login', { ascending: false, nullsFirst: false })
      .order('registration_time', { ascending: false });

    if (error) {
      throw error;
    }
    
    return data || [];
  }

  // Update user status (block/unblock)
  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        status, 
        updated_at: this.getCurrentTimestamp() 
      })
      .eq('id', id)
      .select(this.USER_PUBLIC_FIELDS)
      .single();

    if (error) {
      throw error;
    }
    
    return data;
  }

  // Delete user
  static async delete(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) {
      throw error;
    }
    
    return data;
  }

  // Update last login time
  static async updateLastLogin(id) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: this.getCurrentTimestamp() })
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Block multiple users
  static async blockUsers(userIds) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        status: 'blocked', 
        updated_at: this.getCurrentTimestamp() 
      })
      .in('id', userIds)
      .select(this.USER_PUBLIC_FIELDS);

    if (error) {
      throw error;
    }
    
    return data || [];
  }

  // Delete multiple users
  static async deleteUsers(userIds) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .in('id', userIds)
      .select('id');

    if (error) {
      throw error;
    }
    
    return data || [];
  }
}

module.exports = UserModel;