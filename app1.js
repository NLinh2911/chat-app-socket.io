const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ent = require('ent');
const fs = require('fs');

// Routing: 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index1.html');
});
// Routing to another namespace
app.get('/chat2', (req, res) => {
    res.sendFile(__dirname + '/index1b.html');
});

//===========================================
// MAIN NAMESPACE HAS 3 ROOMS
//===========================================
// rooms which are currently available in chat
const rooms = ['room1', 'room2', 'room3'];
// store usernames of all clients to check uniqueness
let user_main = {};
// usernames which are currently connected to each chat room
let usernames = {};
let usernames1 = {};
let usernames2 = {};
let usernames3 = {};
// MAIN DEFAULT NAMESPACE io.of('/').on()
const main = io.on('connection', (socket) => {
    // when an user connects, their username is received and stored as a session var
    socket.on('new_client', (username) => {
        // if the username already exists -> alert msg
        if (findValue(user_main, username)) {
            socket.emit('duplicate_username', "Username already exists. Please enter another one.");
        } else {
            let oldName = socket.username;
            username = ent.encode(username);
            socket.username = username;
            // if the client is new -> go to room1 by default
            if (!user_main.hasOwnProperty(socket.id)) {
                //store the room name for this client's socket session
                socket.room = 'room1';
                //join the client to room 1 by default
                socket.join(socket.room);
                // add the client's username to the global list
                usernames1[socket.id] = username;
                user_main[socket.id] = username;
                // echo to client they've connected
                socket.emit('new_client', { username: "You", room: socket.room });
                // send to clients in room 1
                socket.broadcast.to('room1').emit('new_client', { username: socket.username, room: socket.room });
                console.log(socket.username + ' connected');
                // update the list of users in chat, client-side
                socket.emit('update_rooms', rooms, 'room1');
                io.sockets.in('room1').emit('update_users', usernames1);
            } else { // if the client changes their username
                //update user list in the room
                usernames = checkRoom(socket.room);
                user_main[socket.id] = username;
                usernames[socket.id] = username;
                io.sockets.emit('change_username', { oldName: oldName, newName: socket.username });
                io.sockets.in(socket.room).emit('update_users', usernames);
            }
        }
    });

    socket.on('disconnect', () => {
        // remove the username from global usernames list
        usernames = checkRoom(socket.room);
        delete usernames[socket.id];
        delete user_main[socket.id];
        socket.broadcast.to(socket.room).emit('update_users', usernames);
        socket.broadcast.to(socket.room).emit('user_disconnect', { username: socket.username, room: socket.room });
        console.log(socket.username + ' disconnected');
    });

    // when client sends a new msg
    socket.on('chat_message', (message) => {
        console.log(message);
        message = ent.encode(message);
        socket.broadcast.to(socket.room).emit('chat_message', { username: socket.username, message: message });
    });
    // when client switches rooms -> receive newroom data from client 
    socket.on('switch_rooms', (newroom) => {
        // find the OLD room that the client is currently in
        usernames = checkRoom(socket.room);
        // remove client from the usernames obj and send message to OLD room
        console.log(socket.room);
        delete usernames[socket.id];
        console.log(usernames);
        socket.broadcast.to(socket.room).emit('user_disconnect', { username: socket.username, room: socket.room });
        socket.broadcast.to(socket.room).emit('update_users', usernames);
        // leave the current room (stored in session)
        socket.leave(socket.room);
        // join new room
        socket.join(newroom);
        socket.emit('new_client', { username: "You", room: newroom });
        // send message to NEW room
        // update socket session room 
        socket.room = newroom;
        console.log(socket.room);
        usernames = checkRoom(socket.room);
        console.log(usernames);
        // add client to the usernames list of the NEW room
        usernames[socket.id] = socket.username;
        console.log(usernames);
        socket.broadcast.to(newroom).emit('new_client', { username: socket.username, room: socket.room });
        io.sockets.in(newroom).emit('update_users', usernames);
        socket.emit('update_rooms', rooms, newroom);
    });
});

//===========================================
// CHAT2 NAMESPACE
//===========================================
const chat2 = io.of('/chat2');
let user_chat2 = {};
chat2.on('connection', (socket) => {
    console.log('client connected', socket.id);
    //chat2.emit('connect', "Welcome to chat 2 nsp");
    socket.on('disconnect', () => {
        console.log("leave socket");
    });
    socket.on('new_users', (username) => {
        if (findValue(user_chat2, username)) {
            socket.emit('duplicate_username', "Username already exists. Please enter another one.");
        } else {
            let oldName = socket.username;
            socket.username = username;
            if (!user_chat2.hasOwnProperty(socket.id)) {
                user_chat2[socket.id] = username;
                chat2.emit('new_users', socket.username);
            } else {
                user_chat2[socket.id] = username;
                chat2.emit('change_username', { oldName: oldName, newName: socket.username });
            }
        }
    });
});
/**
 * Check if a value already exists in an object -> check if an username is already used
 * @param {*} object 
 * @param {*} value 
 */
const findValue = (obj, value) => {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] === value) {
            return true;
        }
    }
    return false;
}
/**
 * Check which room the client is in
 * @param {*} room = socket.room is passed into the function 
 */
const checkRoom = (room) => {
    switch (room) {
        case 'room1':
            usernames = usernames1;
            break;
        case 'room2':
            usernames = usernames2;
            break;
        case 'room3':
            usernames = usernames3;
    }
    return usernames;
}
//===========================================
// LISTEN ON PORT 3003
//===========================================
http.listen(3000, () => {
    console.log('listening on *:3000');
});