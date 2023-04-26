//this is database_handling.js
const sqlite3 = require('sqlite3').verbose();
let db = [];
initializeUserDatabase();

function initializeUserDatabase() {

  db[0] = new sqlite3.Database('users.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the users.db database.');
  });

  db[0].serialize(() => {
    db[0].run(`CREATE TABLE IF NOT EXISTS users (
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

  db[0].serialize(() => {
    db[0].all(`SELECT * FROM users`, (err, rows) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(rows);
      }
    });
  });

  db[0].all('SELECT username FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      // Iterate through users and create a new _transactions.db file for each user
      rows.forEach((row) => {
        let dbName = `${row.username}.db`;
        let dbTransactions = new sqlite3.Database(dbName, (err) => {
          if (err) {
            console.error(err.message);
          }
          console.log(`Connected to the ${dbName} database.`);
  
          // Create transactions table for the user
          dbTransactions.run(
            `CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT,
              category TEXT,
              title TEXT,
              ammount_base REAL,
              ammount_percent_tax REAL,
              ammount_tax REAL,
              from_account TEXT,
              to_account TEXT,
              note TEXT
            )`,
            (err) => {
              if (err) {
                console.error(err.message);
              } else {
                console.log(`Transactions table created for user ${row.username}.`);
              }
            }
          );
        });
  
        // Close the connection to the _transactions.db file
        /*dbTransactions.close((err) => {
          if (err) {
            console.error(err.message);
          }
          console.log(`Connection to the ${dbName} database closed.`);
        });*/
        dbTransactions.serialize(() => {
          db[0].all(`SELECT * FROM transactions`, (err, rows) => {
            if (err) {
              console.error(err.message);
            } else {
              console.log(rows);
            }
          });
        });
        db.push(dbTransactions);
      });
    }
  });
  
  // Close the connection to the users.db file
  /*dbUsers.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connection to the users.db database closed.');
  });*/
}

function addNewTransactionsTable(username, userId){
    db[userId].serialize(() => {
    db[userId].run(`CREATE TABLE IF NOT EXISTS ${username}_transactions (
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

function addNewInvoicesTable(username, userId){
    db[userId].serialize(() => {
    db[userId].run(`CREATE TABLE IF NOT EXISTS ${username}_invoices (
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


  
  module.exports = {
    db: db,
    addNewTransactionsTable: addNewTransactionsTable,
    addNewInvoicesTable: addNewInvoicesTable,
  };