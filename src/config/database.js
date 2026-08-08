const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'complaints.db');

function getDatabase() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

function initializeDatabase() {
  const db = getDatabase();
  
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      createdAt TEXT NOT NULL
    )
  `);
  
  // Complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      location TEXT,
      evidenceImage TEXT,
      aiPriority TEXT,
      aiConfidence INTEGER,
      aiReason TEXT,
      aiRiskFactors TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  
  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_complaints_userId ON complaints(userId);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
  `);
  
  // Add evidenceImage column if it doesn't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE complaints ADD COLUMN evidenceImage TEXT`);
  } catch (err) {
    // Column already exists, ignore error
  }
  
  // Add AI analysis columns if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE complaints ADD COLUMN aiPriority TEXT`);
  } catch (err) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE complaints ADD COLUMN aiConfidence INTEGER`);
  } catch (err) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE complaints ADD COLUMN aiReason TEXT`);
  } catch (err) {
    // Column already exists, ignore error
  }
  
  try {
    db.exec(`ALTER TABLE complaints ADD COLUMN aiRiskFactors TEXT`);
  } catch (err) {
    // Column already exists, ignore error
  }
  
  db.close();
}

module.exports = { getDatabase, initializeDatabase };
