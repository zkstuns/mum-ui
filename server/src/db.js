const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'invoices.db');
const db = new Database(dbPath);

// Initialize table
db.prepare(`
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  size INTEGER NOT NULL,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  notes TEXT
)
`).run();

module.exports = db;
