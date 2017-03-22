# CHAT APPLICATION WITH SOCKET.IO

## DIFFERENT VERSIONS:
1. Simple chat with user list: 
```js
    npm i
    node app.js
```
2. Chat has 3 rooms and user list:
```js
    npm i
    node app1.js
```
3. Chat app has full functionalities as below and can connect to another namespace (localhost:3000/chat2)
```js
    npm i
    node app2.js
```

## FUNCTIONALITIES:
1. Choose an username when connected. The username must be unique (check uniqueness in server).
2. Each client can change their username as long as the username is not yet registered.
3. There are 3 rooms and after connection, clients are sent to room 1 by default. Clients can change between rooms.
4. Room users list shows all users in each room and all online users list shows all connected clients regardless of their current rooms. The lists are updated when clients switch rooms or disconnects.
5. Messages can be sent to all online users, to users in a room or to a specific user.
* Syntax: @ALL: to send to all online users
* @UniqueUserName: to send to a specific user (must enter correct name, case-sensitive);  

## REFERENCE:
http://psitsmike.com/2011/10/node-js-and-socket-io-multiroom-chat-tutorial/
