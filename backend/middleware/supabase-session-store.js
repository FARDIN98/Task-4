const { Store } = require('express-session');
const supabase = require('../config/database');

class SupabaseSessionStore extends Store {
  constructor(options = {}) {
    super(options);
    this.tableName = options.tableName || 'sessions';
  }

  // Get session data
  async get(sid, callback) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('sess, expire')
        .eq('sid', sid)
        .single();

      if (error && error.code !== 'PGRST116') {
        return callback(error);
      }

      if (!data) {
        return callback();
      }

      // Check if session has expired
      if (data.expire && new Date(data.expire) <= new Date()) {
        return this.destroy(sid, callback);
      }

      callback(null, data.sess);
    } catch (err) {
      callback(err);
    }
  }

  // Set session data
  async set(sid, session, callback) {
    try {
      const expire = this.getExpireDate(session);
      
      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          sid,
          sess: session,
          expire: expire.toISOString()
        });

      if (error) {
        return callback(error);
      }

      callback();
    } catch (err) {
      callback(err);
    }
  }

  // Destroy session
  async destroy(sid, callback) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('sid', sid);

      if (error) {
        return callback(error);
      }

      callback();
    } catch (err) {
      callback(err);
    }
  }

  // Touch session (update expiry)
  async touch(sid, session, callback) {
    try {
      const expire = this.getExpireDate(session);
      
      const { error } = await supabase
        .from(this.tableName)
        .update({ expire: expire.toISOString() })
        .eq('sid', sid);

      if (error) {
        return callback(error);
      }

      callback();
    } catch (err) {
      callback(err);
    }
  }

  // Get session count
  async length(callback) {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return callback(error);
      }

      callback(null, count);
    } catch (err) {
      callback(err);
    }
  }

  // Clear all sessions
  async clear(callback) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .neq('sid', ''); // Delete all rows

      if (error) {
        return callback(error);
      }

      callback();
    } catch (err) {
      callback(err);
    }
  }

  // Get all session IDs
  async all(callback) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('sid, sess, expire');

      if (error) {
        return callback(error);
      }

      const sessions = {};
      data.forEach(row => {
        // Check if session has expired
        if (!row.expire || new Date(row.expire) > new Date()) {
          sessions[row.sid] = row.sess;
        }
      });

      callback(null, sessions);
    } catch (err) {
      callback(err);
    }
  }

  // Helper method to calculate expiry date
  getExpireDate(session) {
    let expire;
    if (session && session.cookie && session.cookie.expires) {
      expire = new Date(session.cookie.expires);
    } else if (session && session.cookie && session.cookie.maxAge) {
      expire = new Date(Date.now() + session.cookie.maxAge);
    } else {
      expire = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours default
    }
    return expire;
  }
}

module.exports = SupabaseSessionStore;