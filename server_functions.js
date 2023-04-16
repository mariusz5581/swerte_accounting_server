//this is server_functions.js
const { db, addNewAccountingTable, addNewInvoicesTable } = require('./database_handling');

function handleMessage(socket, message) {
  const data = message.split('|#|');
  const action = data[0];

  var username = '';
  var password = '';

  
  switch (action) {
    case 'login':
      username = data[1];
      password = data[2];
      login(socket, username, password);
      break;
      case 'register':
      username = data[1];
      password = data[2];
      addNewUser(socket, username, password);
      break;
      case 'get_transactions':
      username = data[1];
      sendAllTransactions(socket, username);
      break;
      case 'add_new_transaction':
        username = data[1];
        addNewTransaction(socket,username, data)
        break;
        case 'update_transaction':
        updateTransaction(socket, username, data);
        break;

    case 'delete_transaction':
    var username = data[1];
    var id = data[2];
    deleteTransaction(socket, username, id);
    break;

    default:
        socket.send('No such action');
    }
}

function login(socket, username, password) {
    var db_cmd = 'SELECT * FROM users_credentials_tab WHERE username = ? AND password = ?';
    db.get(db_cmd, [username, password], (err, row) => {
      if (err) {
        console.error(err.message);
        socket.send('Error while attempting to verify user');
      } else {
        if (row) {
          socket.send('Login successful');
        } else {
          socket.send('Invalid credentials');
        }
      }
    });
}

function addNewUser(socket, username, password){
    db.run(`INSERT INTO users_credentials_tab (username, password) VALUES (?, ?)`, [username, password], (err) => {
        if (err) {
            console.error(err.message);
            socket.send('Register new user failed');
        } else {
            addNewAccountingTable(username);
            addNewInvoicesTable(username);
            socket.send('Registration successful');
            console.log(`New user with username '${username}' has been added to the database.`);
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
      socket.send('Transaction added successfully');
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

