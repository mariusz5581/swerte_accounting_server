//this is server_functions.js
const { db, createNewUserDatabase, setTables, addNewUserToDatabase} = require('./database_handling');

class Data{
  user = new UserData();
  transaction = [new TransactionData()];
}

class TransactionData{
  id = '';
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
    
    //console.log('Processed revied data:');
    //console.log(d);
    //console.log('----------------------');
    switch(identifier){
      case 'action':
        t.user.action = value;
        break;
      case 'registeredUserId':
        t.user.registeredUserId = value;
        break;
      case 'registeredUsername':
        t.user.registeredUsername = value;
        break;
      case 'password':
        t.user.password = value;
        break;
      default:
        console.log('ERR: unknown identifier:' + identifier);
        break;
    }
  }

  
  switch (t.user.action) {
    case 'login_user':
        loginUser(socket, t.user.registeredUsername, t.user.password);
    break;
    case 'register_new_user':
        registerNewUser(socket, t.user.registeredUsername, t.user.password);
    break;
    case 'getTransactions':
        sendAllTransactions(socket, t);
    break;
    case 'add_new_transaction':
        addNewTransaction(socket,t, data);
    break;
    case 'update_transaction':
        updateTransaction(socket, t.user.registeredUsername, data);
    break;
    case 'delete_transaction':
        deleteTransaction(socket, t.registeredUsername, t.transaction.id);
    break;

    default:
        socket.send(`No such action as ${t.action}`);
    }
}

function loginUser(socket, username, password) {
  var db_cmd = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db[0].get(db_cmd, [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      socket.send('Error while attempting to verify user');
    } else {
      if (row) {
        var userPermissions = userTablePermissions(row.id);
        console.log('userPermissions:' + userPermissions);

        // Send the user ID, table IDs, and success message
        socket.send(`result|^|OK|#|action|^|login|#|registeredUserId|^|${row.id}|#|registeredUsername|^|${username}|#|userPermissions|^|${userPermissions}`);
      } else {
        socket.send('Invalid credentials');
      }
    }
  });
}

function userTablePermissions(id) {
  var result;
  var db_cmd = 'SELECT * FROM user_table_permissions WHERE user_id = ?';
  db[0].get(db_cmd, [id], (err, row) => {
    if (err) {
      console.error('searching for id:' + id.toString()+ ' ' + err.message);
      socket.send('Error while attempting to verify user');
    } else {
      console.log('id:' + id);
      if (row) {
        // Send the user ID, table IDs
        result = `${row.table_ids}|!|${row.permission_levels}`;
        console.log('row result:' + result);
      } else {
        console.error('ERR:userTablePermissions: no match');
      }
    }
  });
  console.log('result:' + result);
  return result;
}






function registerNewUser(socket, username, password) {
  const id = db.length;
  var result = '';

  // Add default table ID for the new user
  const defaultTableId = `transactions`;

  // Update this line
  // db[0].run(`INSERT INTO users (id, username, password) VALUES (?, ?, ?)`, [id.toString(), username, password], function (err) {

  // To include the table_ids column
  db[0].run(`INSERT INTO users (id, username, password) VALUES (?, ?, ?)`, [id.toString(), username, password], function (err) {
    if (err) {
      console.error(err.message);
    } else {
      const permissionLevels = 'admin';
      db[0].run(`INSERT INTO user_table_permissions (id, table_ids, user_id, permission_levels) VALUES (?, ?, ?, ?)`, [id.toString(), id.toString(), id.toString(), permissionLevels], function (err) {
        if (err) {
          console.error('user_table_permissions' + err.message);
          return;
        } });
      result = addNewUserToDatabase(username, password);
      socket.send(`result|^|${result}|#|action|^|registerNewUser|#|registeredUserId|^|${id.toString()}|#|registeredUsername|^|${username}`);
      console.log(`New user with username '${username}' and ID '${id}', result is ${result}`);
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

  db[t.user.registeredUserId].all(db_cmd, (err, rows) => {
    if (err) {
      console.error(err.message);
      socket.send('Error while fetching transactions');
    } else {
      var transactions = rows.map(row => {
        return [
          'transactionId|^|' + row.id,
          'category|^|' + row.category,
          'title|^|' + row.title,
          'baseAmount|^|' + row.ammount_base,
          'percentOfTax|^|' + row.ammount_percent_tax,
          'amountOfTax|^|' + row.ammount_tax,
          'fromAccount|^|' + row.from_account,
          'toAccount|^|' + row.to_account,
          'creationDate|^|' + row.creation_date,
          'createdByUser|^|' + row.created_by_user,
          'modificationDates|^|' + row.modifications_dates,
          'modificationByUsers|^|' + row.modified_by_users,
          'note|^|' + row.note,
          'endOfTransaction|^|',
        ].join('|#|');});
        
      console.log('sendAllTransactions:');
      console.log(JSON.stringify(transactions));
      socket.send(transactions);
    }
  });
}


function addNewTransaction(socket, t, data){
  var result = 'OK';  
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
        
        var table_name = `transactions`;
        var sql = `INSERT INTO ${table_name} (date, category, title, ammount_base, ammount_percent_tax, ammount_tax, from_account, to_account, note) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        var values = [date, category, title, ammount_base, ammount_percent_tax, ammount_tax, from_account, to_account, note];
        
        db[t.user.registeredUserId].run(sql, values, (err) => {
            if (err) {
              result = err.message;
                console.error(result);
                socket.send(result);
            } else {
      console.log(`New transaction added to transactions`);
      socket.send(`result|^|${result}|#|action|^|addTransaction|#|registeredUserId|^|${id.toString()}|#|registeredUsername|^|${username}`);

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

