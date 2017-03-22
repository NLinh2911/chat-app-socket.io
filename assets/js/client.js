// CLIENT-SIDE SOCKET.IO
// DEFAULT NAMESPACE (/)
$(function () {
    // connect to socket.io
    const socket = io();

    // new client is requested to register an username to enter chat rooms
    socket.on('connect', () => {
        alert('Welcome to the main chat room!!!')
    });

    // client sends an username to server
    $('#usr_form').submit(() => {
        let username = $('#usr').val();
        // send to server
        socket.emit('new_client', username);
        // display in browser's title and on pages
        document.title = username + ' - ' + document.title;
        $('#usr').val('');
        return false;
    });

    // display an announcement when a new user connects
    socket.on('new_client', (data) => {
        $('#messages').append(`<li class="notif"><em> ${data.username} </em> has joined the chat in ${data.room} !</li>`);
    });

    // alert when a duplicated username is chosen 
    socket.on('duplicate_username', (msg) => {
        alert(msg);
    });

    // display an announcement when an user changes name
    socket.on('change_username', (data) => {
        $('#messages').append(`<li>${data.oldName} changes the username to ${data.newName} </li>`)
    });

    // display an announcement when a new user disconnects from a room
    socket.on('user_disconnect', (data) => {
        $('#messages').append(`<li class="notif"><em> ${data.username} </em> has left ${data.room} !</li>`);
    })

    // listener, whenever a new client connects, update all online users list
    socket.on('online_users', (data) => {
        $('#online_users').empty();
        $.each(data, (key, value) => {
            $('#online_users').append(`<p><a href="#">${value}</a></p>`);
        });

    });

    // listener, whenever the server emits 'update_users', this updates the username list
    socket.on('update_users', (data) => {
        $('#users').empty();
        $.each(data, (key, value) => {
            $('#users').append(`<p><a href="#">${value}</a></p>`);
        });
    });
/*
    // create a new room
    $('#create_room').click(() => {
        socket.emit('new_room');
    });
    socket.on('create_room', (newroom) => {
        $('#rooms').append(`<div>${newroom}</div>`);
        $('#rooms').append(`<button id="${newroom}">JOIN</button>`);
        $(`#${newroom}`).click(() => {
            let room = `${newroom}`;
            switchRoom(room);
        });
    });
*/
    // listener, whenever the server emits 'update_rooms', this updates the room the client is in
    socket.on('update_rooms', (rooms, current_room) => {
        $('#rooms').empty();
        $.each(rooms, (key, value) => {
            $('#rooms').append(`<div>${value}</div>`);
            $('#rooms').append(`<button id="${value}"></button>`);
            if (value == current_room) {
                $(`#${value}`).text('LEAVE');
            }
            else {
                $(`#${value}`).text('JOIN');
                $(`#${value}`).click(() => {
                    let room = `${value}`;
                    switchRoom(room);
                });
            }
        });
    });
    const switchRoom = (room) => {
        socket.emit('switch_rooms', room);
    }

    // a new msg is sent to server
    $('#msg_form').submit(() => {
        let message = $('#msg').val();
        socket.emit('chat_message', message);
        $('#msg').val('').focus();
        return false; // will not reload the page
    });

    // receive the data sent back from server and display on page
    socket.on('chat_message', (data) => {
        insertMsg(data.username, data.message, data.type);
    });

    // insert messages on pages
    const insertMsg = (username, message, type) => {
        if (username === "Me") {
            $('#messages').append(`<li class="own_msg"><strong class="username">${username}:</strong> ${message}</li>`);
        } else if (type === "private") {
            $('#messages').append(`<li class="other_msg private_msg"><strong class="username">${username}:</strong> ${message}</li>`);
        } else {
            $('#messages').append(`<li class="other_msg"><strong class="username">${username}:</strong> ${message}</li>`);
        }
    }
});