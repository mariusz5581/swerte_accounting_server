//this is server_functions.js
const db = require('./database_handling');

function handleMessage(socket, message) {
  const data = message.split(' ');
  const action = data[0];

  var username = '';
  var password = '';


  switch (action) {
    case 'login':
      username = data[1];
      password = data[2];
      handleLogin(socket, username, password);
      break;
      case 'register':
      username = data[1];
      password = data[2];
      addNewUser(socket, username, password);
      break;
    case 'add':
      // Add your handling code for the add action here
      break;
    case 'update':
      // Add your handling code for the update action here
      break;
    case 'delete':
      // Add your handling code for the delete action here
      break;
    default:
        socket.send('No such action');
  }
}

function handleLogin(socket, username, password) {
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
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
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
        if (err) {
            console.error(err.message);
            socket.send('Register new user failed');
        } else {
            socket.send('Register new user successful');
            console.log(`New user with username '${username}' has been added to the database.`);
        }
    });
}

module.exports = handleMessage;

