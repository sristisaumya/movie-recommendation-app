const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./movies.db", (err) => {
  if (err) console.log("Database Error:", err);
  else console.log("SQLite database connected ✅");
});

// Table create
db.run(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_input TEXT NOT NULL,
    recommended_movies TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
