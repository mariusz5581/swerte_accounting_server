//this is server_functions.js
function handleMessage(socket, message) {
  const data = message.split(' ');
  const action = data[0];

  switch (action) {
    case 'login':
      const username = data[1];
      const password = data[2];
      handleLogin(socket, username, password);
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

module.exports = handleMessage;
