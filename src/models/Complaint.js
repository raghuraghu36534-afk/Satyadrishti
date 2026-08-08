const { getDatabase } = require('../config/database');
const crypto = require('crypto');

class Complaint {
  static create({ userId, title, description, category, priority, location, evidenceImage, aiPriority, aiConfidence, aiReason, aiRiskFactors }) {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    
    const stmt = db.prepare(`
      INSERT INTO complaints (id, userId, title, description, category, status, priority, location, evidenceImage, aiPriority, aiConfidence, aiReason, aiRiskFactors, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, userId, title, description, category, 'pending', priority || 'medium', location || null, evidenceImage || null, aiPriority || null, aiConfidence || null, aiReason || null, aiRiskFactors || null, createdAt, updatedAt);
    db.close();
    
    return this.findById(id);
  }
  
  static findById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM complaints WHERE id = ?');
    const complaint = stmt.get(id);
    db.close();
    return complaint || null;
  }
  
  static findByUserId(userId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM complaints 
      WHERE userId = ? 
      ORDER BY createdAt DESC
    `);
    const complaints = stmt.all(userId);
    db.close();
    return complaints;
  }
  
  static updateStatus(id, status) {
    const db = getDatabase();
    const updatedAt = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE complaints 
      SET status = ?, updatedAt = ? 
      WHERE id = ?
    `);
    
    stmt.run(status, updatedAt, id);
    db.close();
    
    return this.findById(id);
  }
  
  static update(id, updates) {
    const db = getDatabase();
    const updatedAt = new Date().toISOString();
    
    const fields = [];
    const values = [];
    
    if (updates.title) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.category) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.priority) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.location !== undefined) {
      fields.push('location = ?');
      values.push(updates.location);
    }
    if (updates.evidenceImage !== undefined) {
      fields.push('evidenceImage = ?');
      values.push(updates.evidenceImage);
    }
    
    fields.push('updatedAt = ?');
    values.push(updatedAt);
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE complaints 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);
    
    stmt.run(...values);
    db.close();
    
    return this.findById(id);
  }
  
  static delete(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM complaints WHERE id = ?');
    const result = stmt.run(id);
    db.close();
    return result.changes > 0;
  }
  
  static getStats(userId) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as inProgress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
      FROM complaints 
      WHERE userId = ?
    `);
    const stats = stmt.get(userId);
    db.close();
    return stats;
  }
  
  static getRecent(userId, limit = 5) {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT * FROM complaints 
      WHERE userId = ? 
      ORDER BY createdAt DESC 
      LIMIT ?
    `);
    const complaints = stmt.all(userId, limit);
    db.close();
    return complaints;
  }
  
  static getAll() {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT c.*, u.fullName as userName, u.email as userEmail
      FROM complaints c
      JOIN users u ON c.userId = u.id
      ORDER BY c.createdAt DESC
    `);
    const complaints = stmt.all();
    db.close();
    return complaints;
  }
}

module.exports = Complaint;
