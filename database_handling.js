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

function addNewAccountingTable(username){
    db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${username}_accounting (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              category TEXT NOT NULL,
              title TEXT NOT NULL,
              ammount_base TEXT NOT NULL,
              ammount_percent_tax TEXT NOT NULL,
              ammount_tax TEXT NOT NULL,
              from_account TEXT NOT NULL,
              to_account TEXT NOT NULL,
              note TEXT
            )`, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log('Users table created or already exists.');
      }
    });
  });
}

db.serialize(() => {
    db.all(`SELECT * FROM users`, (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(rows);
      }
    });
  });
  
  


  module.exports = {
    db: db,
    addNewAccountingTable: addNewAccountingTable
  };