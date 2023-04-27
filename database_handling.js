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
            password TEXT NOT NULL,
            table_ids TEXT NOT NULL
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

  db[0].all('SELECT id, username FROM users', (err, rows) => {
    if (err) {
      console.error(err.message);
    } else {
      // Iterate through users and create a new _transactions.db file for each user
      console.log('rows:');
      console.log(rows);
      rows.forEach((row) => {
        let _db = new sqlite3.Database(`${row.id}.db`, (err) => {
          if (err) {
            console.error(err.message);
          }
          console.log(`Connected to the ${row.id}.db database.`);
        });

        db.push(_db);
        console.log('index of _db:' + db.indexOf(_db) + ' and row.id:' + row.id + ' must match');
        setTables(row.id);
      });
    }
  });

}

function addNewUserToDatabase(username, password) {
  db[0].run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], function (err) {
    if (err) {
      return err;
    } else {
      var db_cmd = 'SELECT * FROM users WHERE username = ? AND password = ?';
      db[0].get(db_cmd, [username, password], (err, row) => {
        if (err) {
          console.error(err.message);
          return err.message;
        } 
        let _db = new sqlite3.Database(`${row.id}.db`, (err) => {
          if (err) {
            console.error(err.message);
            return err.message;
          }
          console.log(`Connected to the ${row.id}.db database.`);
          db[row.id] =_db;
          setTables(row.id);
          
        });

        
      });
    }
  });
  return 'OK';
}
  
  
  
  // Close the connection to the users.db file
  /*dbUsers.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connection to the users.db database closed.');
  });*/


function setTables(userId){
  setTransactionTable(userId);
  setAccountingAccountsTable(userId);
  setClientsTable(userId);
  setInvoicesTable(userId);
  setProductsTable(userId);
}

function setTransactionTable(userId){
    db[userId].serialize(() => {
    db[userId].run(`CREATE TABLE IF NOT EXISTS transactions (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              category TEXT NOT NULL,
              title TEXT NOT NULL,
              ammount_base TEXT NOT NULL,
              ammount_percent_tax TEXT NOT NULL,
              ammount_tax TEXT NOT NULL,
              from_account TEXT NOT NULL,
              to_account TEXT NOT NULL,
              creation_date TEXT NOT NULL,
              created_by_user TEXT NOT NULL,
              modifications_date TEXT,
              modified_by_users TEXT,
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

function setAccountingAccountsTable(userId){
  db[userId].serialize(() => {
  db[userId].run(`CREATE TABLE IF NOT EXISTS accounting_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            category TEXT NOT NULL,
            tags TEXT,
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

function setInvoicesTable(userId){
    db[userId].serialize(() => {
    db[userId].run(`CREATE TABLE IF NOT EXISTS invoices (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT NOT NULL,
              category TEXT NOT NULL,
              title TEXT NOT NULL,
              ammount_base TEXT NOT NULL,
              ammount_percent_tax TEXT NOT NULL,
              ammount_tax TEXT NOT NULL,
              client_id TEXT NOT NULL,
              product_id TEXT NOT NULL,
              tags TEXT,
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

function setClientsTable(userId){
  db[userId].serialize(() => {
  db[userId].run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            bank_account_number TEXT NOT NULL,
            email_address TEXT NOT NULL,
            tags TEXT,
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

function setProductsTable(userId){
  db[userId].serialize(() => {
  db[userId].run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            tax_percent TEXT NOT NULL,
            price TEXT,
            tags TEXT,
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
    setTables: setTables,
    addNewUserToDatabase: addNewUserToDatabase
  };