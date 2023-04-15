//this is database_handling.js
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('accounting_db.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the accounting_db database.');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
          )`, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Users table created or already exists.');
    }
  });
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS swerte_oy_accounting (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              username TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL
            )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });
  });

db.serialize(() => {
    db.all(`SELECT * FROM users`, (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(rows);
      }
    });
  });
  
  



module.exports = db;
