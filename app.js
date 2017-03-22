const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ent = require('ent');
const fs = require('fs');

// Load index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
//
app.get('/nsp2', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
/**
 * SET UP NSP
 * @param {*} nspId 
 */
// usernames which are currently connected to the chat
var usernames = {};

io.on('connection', (socket) => {
  // when an user connects, their username is received and stored as a session var
  socket.on('new_client', (username) => {
    username = ent.encode(username);
    socket.username = username;
    // add the client's username to the global list
		usernames[username] = username;
    socket.broadcast.emit('new_client', username);
    console.log(socket.username + ' connected');
    // update the list of users in chat, client-side
		io.emit('update_users', usernames);
  });

  socket.on('disconnect', () => {
    // remove the username from global usernames list
		delete usernames[socket.username];
    io.emit('update_users', usernames);
    socket.broadcast.emit('user_disconnect', socket.username);
    console.log(socket.username + ' disconnected');
  });

  // when a new message is received
  socket.on('chat_message', (message) => {
    console.log(message);
    message = ent.encode(message);
    socket.broadcast.emit('chat_message', { username: socket.username, message: message });
  });
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});