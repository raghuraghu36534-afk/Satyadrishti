const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static create({ fullName, email, password, phone }) {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO users (id, fullName, email, password, phone, createdAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run(id, fullName, email, passwordHash, phone || null, createdAt);
      db.close();
      return { id, fullName, email, phone, createdAt };
    } catch (error) {
      db.close();
      if (error.code === 'SQLITE_CONSTRAINT') {
        const err = new Error('Email already registered');
        err.code = 'EMAIL_TAKEN';
        throw err;
      }
      throw error;
    }
  }
  
  static findByEmail(email) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email.toLowerCase());
    db.close();
    return user || null;
  }
  
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    db.close();
    return user || null;
  }
  
  static verifyPassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }
  
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare('SELECT id, fullName, email, phone, createdAt FROM users ORDER BY createdAt DESC');
    const users = stmt.all();
    db.close();
    return users;
  }
}

module.exports = User;
