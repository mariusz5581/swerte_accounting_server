//this is server_functions.js
const { db, createNewUserDatabase, addNewTransactionsTable, addNewInvoicesTable } = require('./database_handling');

class Data{
  user = new UserData();
  transaction = [new TransactionData()];
}

class TransactionData{
  date = '';
  title = '';
  catergory = '';
  baseAmmount = '';
  percentOfTax = '';
  ammountOfTax = '';
  fromAccount = '';
  toAccount = '';
}

class UserData{
  action = '';
  registeredUsername = '';
  password = '';
  registeredUserId = '';
}

function handleMessage(socket, message) {
  var t = new Data();
  const data = message.split('|#|');
  

  for(var i = 0;i<data.length;i++){
    var d = data[i].split('|^|');
    const identifier = d[0];
    const value = d[1];
    console.log(d);
    switch(identifier){
      case 'action':
        t.action = value;
        break;
      case 'registeredUserId':
        t.registeredUserId = value;
        break;
      case 'registeredUsername':
        t.registeredUsername = value;
        break;
      case 'password':
        t.password = value;
        break;
      default:
        console.log('data:'+ data);
        break;
    }
  }

  
  switch (t.action) {
    case 'login':
        login(socket, t.registeredUsername, t.password);
    break;
    case 'register':
        addNewUser(socket, t.registeredUsername, t.password);
    break;
    case 'getTransactions':
        sendAllTransactions(socket, t);
    break;
    case 'add_new_transaction':
        addNewTransaction(socket,t, data);
    break;
    case 'update_transaction':
        updateTransaction(socket, t.registeredUsername, data);
    break;
    case 'delete_transaction':
        deleteTransaction(socket, t.registeredUsername, t.id);
    break;

    default:
        socket.send(`No such action as ${t.action}`);
    }
}

function login(socket, username, password) {
  var db_cmd = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db[0].get(db_cmd, [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      socket.send('Error while attempting to verify user');
    } else {
      if (row) {
        // When username and password match, send the user ID along with the success message
        socket.send(`result|^|OK|#|action|^|login|#|registeredUserId|^|${row.id}|#|registeredUserName|^|${username}`);
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
      socket.send('result|^|' + err.message + '|#|action|^|registerNewUser');
    } else {
      const userDb = createNewUserDatabase(username, id);
      db[id] = userDb;

      addNewTransactionsTable(username,id);
      addNewInvoicesTable(username,id);

      socket.send(`result|^|OK|#|action|^|registerNewUser|#|registeredUserId|^|${id.toString()}|#|registeredUserName|^|${username}`);
      console.log(`New user with username '${username}' and ID '${id}' has been added to the database.`);
    }
  });
}

function sendAllTransactions(socket, t) {
  var table_name = `transactions`;
  var db_cmd = `SELECT * FROM ${table_name}`;
  console.log('db.length:----------------------------------');
  console.log(db.length);
  console.log('t:----------------------------------');
  console.log(t);
  console.log('t.user:----------------------------------');
  console.log(t.user);
  console.log('t.user.registeredUserId:----------------------------------');
  console.log(t.user.registeredUserId);

  db[t.user.registeredUserId].all(db_cmd, (err, rows) => {
    if (err) {
      console.error(err.message);
      socket.send('Error while fetching transactions');
    } else {
      var transactions = rows.map(row => {
        return [
          'transactionId|^|' + row.id,
          'date|^|' + row.date,
          'category|^|' + row.category,
          'title|^|' + row.title,
          'baseAmount|^|' + row.ammount_base,
          'percentOfTax|^|' + row.ammount_percent_tax,
          'amountOfTax|^|' + row.ammount_tax,
          'fromAccount|^|' + row.from_account,
          'toAccount|^|' + row.to_account,
          'note|^|' + row.note,
          'endOfTransaction|^|',
        ].join('|#|');});
        
      console.log('sendAllTransactions:');
      console.log(JSON.stringify(transactions));
      socket.send(transactions);
    }
  });
}


function sendAllTransactions_OLD(socket, username){
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
          ].join('|&|');
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

