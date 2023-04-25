//this is database_handling.js
const sqlite3 = require('sqlite3').verbose();
const users = new sqlite3.Database('users.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the users.db database.');
}); 


function createNewUserDatabase(username, userId) {
  const dbName = `${username}_${userId}.db`;
  const userDb = new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Created new database for user ${username} with ID ${userId}`);
    }
  });

  return userDb;
}

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

function addNewTransactionsTable(username){
    db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${username}_transactions (
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

function addNewInvoicesTable(username){
    db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ${username}_invoices (
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
    users: users,
    db: db,
    createNewUserDatabase: createNewUserDatabase,
    addNewAccountingTable: addNewTransactionsTable,
    addNewInvoicesTable: addNewInvoicesTable,
  };