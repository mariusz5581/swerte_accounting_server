//this is server_functions.js
const { db, createNewUserDatabase, addNewTransactionsTable, addNewInvoicesTable } = require('./database_handling');


function handleMessage(socket, message) {
  const data = message.split('|#|');
  var action = '';
  var registeredUsername = '';
  var password = '';
  var registeredUserId = '';


  for(var i = 0;i<data.length;i++){
    var t = data[i].split('|^|');
    const identifier = t[0];
    const value = t[1];
    console.log(data[i]);
    switch(identifier){
      case 'action':
        action = value;
        break;
      case 'registeredUserId':
        registeredUserId = value;
        break;
      case 'registeredUsername':
        registeredUsername = value;
        break;
      case 'password':
        password = value;
        break;
      default:
        console.log('data:'+ data);
        break;
    }
  }

  
  switch (action) {
    case 'login':
        login(socket, registeredUsername, password);
    break;
    case 'register':
        addNewUser(socket, registeredUsername, password);
    break;
    case 'get_transactions':
        sendAllTransactions(socket, registeredUsername);
    break;
    case 'add_new_transaction':
        addNewTransaction(socket,registeredUsername, data);
    break;
    case 'update_transaction':
        updateTransaction(socket, registeredUsername, data);
    break;
    case 'delete_transaction':
        deleteTransaction(socket, registeredUsername, id);
    break;

    default:
        socket.send('No such action');
    }
}

function login(socket, username, password) {
    var db_cmd = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db[0].get(db_cmd, [id, username, password], (err, row) => {
      if (err) {
        console.error(err.message);
        socket.send('Error while attempting to verify user');
      } else {
        if (row['username'] == username && row['password'] == password) {
          socket.send('Login successful');
        } else {
          socket.send('Invalid credentials');
        }
      }
    });
}

function addNewUser(socket, username,password) {
  
  const id = db.length;
  db[0].run(`INSERT INTO users (id, username, password) VALUES (?, ?, ?)`, [id.toString(), username, password], function (err) {
    if (err) {
      console.error(err.message);
      socket.send(err.message);
    } else {
      const userDb = createNewUserDatabase(username, id);
      db[id] = userDb;

      addNewTransactionsTable(username,id);
      addNewInvoicesTable(username,id);

      socket.send('Registration successful');
      console.log(`New user with username '${username}' and ID '${id}' has been added to the database.`);
    }
  });
}

function sendAllTransactions(socket, username){
    var table_name = `${username}_transactions`;
    var db_cmd = `SELECT * FROM ${table_name}`;
    db.all(db_cmd, (err, rows) => {
        if (err) {
          console.error(err.message);
          socket.send('Error while fetching transactions');
        } else {
          var transactions = rows.map(row => {
            return [
              row.id,
              row.date,
              row.category,
              row.title,
              row.ammount_base,
              row.ammount_percent_tax,
              row.ammount_tax,
              row.from_account,
              row.to_account,
              row.note
            ].join('|#|');
          }).join('|@|');
          transactions.slice(0,transactions.length-7);
          console.log('sendAllTransactions:');
          console.log(JSON.stringify(transactions))
          socket.send(transactions);
        }
      });
}


function addNewTransaction(socket, username, data){
    username = data[1];
        var date = data[2];
        var category = data[3];
        var title = data[4];
        var ammount_base = data[5];
        var ammount_percent_tax = data[6];
        var ammount_tax = data[7];
        var from_account = data[8];
        var to_account = data[9];
        var note = data[10];
        
        var table_name = `${username}_transactions`;
        var sql = `INSERT INTO ${table_name} (date, category, title, ammount_base, ammount_percent_tax, ammount_tax, from_account, to_account, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        var values = [date, category, title, ammount_base, ammount_percent_tax, ammount_tax, from_account, to_account, note];
        
        db.run(sql, values, (err) => {
            if (err) {
                console.error(err.message);
                socket.send('Error while adding transaction');
            } else {
      console.log(`New transaction added to ${table_name}`);
      socket.send('Transaction added');
    }
  });
}

function updateTransaction(socket, username, data){
    var username = data[1];
    var id = data[2];
    var date = data[3];
    var category = data[4];
    var title = data[5];
    var ammount_base = data[6];
    var ammount_percent_tax = data[7];
    var ammount_tax = data[8];
    var from_account = data[9];
    var to_account = data[10];
    var note = data[11];
    
    var table_name = `${username}_transactions`;
    var sql = `UPDATE ${table_name} SET 
    date = ?, 
    category = ?, 
    title = ?, 
    ammount_base = ?, 
    ammount_percent_tax = ?, 
    ammount_tax = ?, 
    from_account = ?, 
    to_account = ?, 
    note = ? 
    WHERE id = ?`;
    var values = [date, category, title, ammount_base, ammount_percent_tax, ammount_tax, from_account, to_account, note, id];
    
    db.run(sql, values, (err) => {
        if (err) {
            console.error(err.message);
    socket.send('Error while updating transaction');
  } else {
    console.log(`Transaction ${id} updated in ${table_name}`);
    socket.send('Transaction updated successfully');
  }
});

}

function deleteTransaction(socket, username, id){
    var table_name = `${username}_transactions`;
    var sql = `DELETE FROM ${table_name} WHERE id = ?`;

    db.run(sql, id, (err) => {
        if (err) {
        console.error(err.message);
        socket.send('Error while deleting transaction');
        } else {
        console.log(`Transaction ${id} deleted from ${table_name}`);
        socket.send('Transaction deleted successfully');
        }
    });
}

module.exports = handleMessage;

