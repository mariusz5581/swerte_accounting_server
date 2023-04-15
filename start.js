//this is start.js
const WebSocket = require('ws');
const handleMessage = require('./server_functions');



const server = new WebSocket.Server({ port: 5678 });

server.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (data) => {
    console.log(`Received message: ${data}`);
    var message = '';
    message = data.toString();
    handleMessage(socket, message);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server started on port 5678');
