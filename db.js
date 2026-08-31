const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'maya.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Estudiante',
  level TEXT DEFAULT 'A0',
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TEXT DEFAULT '',
  total_msg INTEGER DEFAULT 0,
  voice_msg INTEGER DEFAULT 0,
  errors TEXT DEFAULT '[]',
  vocab TEXT DEFAULT '[]',
  summary TEXT DEFAULT '',
  goals TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
`);


db.exec(`
CREATE TABLE IF NOT EXISTS levels (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  vocab TEXT DEFAULT '[]',
  phrases TEXT DEFAULT '[]',
  exercises TEXT DEFAULT '[]',
  is_exam INTEGER DEFAULT 0,
  required_xp INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_levels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  status TEXT DEFAULT 'locked',
  xp_earned INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  completed_at TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES learners(id),
  FOREIGN KEY (level_id) REFERENCES levels(id),
  UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS user_vocab (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  translation TEXT DEFAULT '',
  level_id INTEGER DEFAULT 0,
  mastered INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  last_seen TEXT DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES learners(id)
);

CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  answers TEXT DEFAULT '[]',
  taken_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES learners(id),
  FOREIGN KEY (level_id) REFERENCES levels(id)
);
`);

module.exports = db;