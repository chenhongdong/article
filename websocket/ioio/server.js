const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

// 访问/music
/* app.get('/music', function(req, res) {
    res.setHeader('Content-Type', 'text/html;charset=utf8');
    res.sendFile(path.resolve(__dirname, './music.html'));
}); */

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const SYSTEM = '系统';

let sockets = {};
let mySockets = {};
let msgArr = [];    // 从旧往新的 slice
// 监听客户端与服务端的连接
io.on('connection', function (socket) {
    mySockets[socket.id] = socket;
    // 用户名，默认为undefined
    let username;
    // 用rooms数组记录进入的房间
    let rooms = [];
    socket.on('message', function (msg) {
        if (username) {
            // 首先要判断是私聊还是公聊
            let result = msg.match(/@([^ ]+) (.+)/);
            
            if (result) {
                let toUser = result[1];
                let content = result[2];
                let toSocket = sockets[toUser];

                if (toSocket) {
                    toSocket.send({
                        user: username,
                        content,
                        createAt: new Date().toLocaleString()
                    });
                } else {
                    // 私聊的用户不在线的话，告诉自己一声
                    socket.send({
                        user: SYSTEM,
                        content: '您私聊的用户不在线',
                        createAt: new Date().toLocaleString()
                    });
                }

            } else {
                // 将之前聊天的记录存到数组中
                msgArr.push({ user: username, content: msg, createAt: new Date().toLocaleString() });

                let msgObj = {
                    user: username,
                    content: msg,
                    createAt: new Date().toLocaleString()
                };

                if (rooms.length) {
                    let targetSockets = {};
                    rooms.forEach(room => {
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        console.log('io.sockets.adapter.rooms[room]');
                        console.log(io.sockets.adapter.rooms);
                        // console.log(roomSockets);
                        Object.keys(roomSockets).forEach(socketId => {
                            if (!targetSockets[socketId]) {
                                targetSockets[socketId] = 1;
                            }
                        });
                    });

                    Object.keys(targetSockets).forEach(socketId => {
                        mySockets[socketId].emit('message', msgObj);
                    });
                } else {
                    // 服务器要向所有的客户端进行广播
                    io.emit('message', msgObj);
                }
            }
        } else {
            // 如果第一次进来没有用户名，就把msg当做用户名
            username = msg;
            // 在sockets对象中缓存 key是用户名 value是socket
            sockets[username] = socket;
            // socket.broadcast表示向除自己以为的所有人广播
            socket.broadcast.emit('message', {
                user: SYSTEM,
                content: `${username}加入了聊天室`,
                createAt: new Date().toLocaleString()
            });
        }

    });
    // 监听进入某个房间
    socket.on('join', function (roomName) {
        if (rooms.indexOf(roomName) === -1) {
            // socket.join表示进入某个房间
            // 如果是第一次进入房间，就把该房间名push到rooms数组中
            socket.join(roomName);
            rooms.push(roomName);

            socket.send({
                user: SYSTEM,
                content: `你已经进入了${roomName}房间`,
                createAt: new Date().toLocaleString()
            });

            socket.emit('joined', roomName);
        }
    });
    // 监听离开某个房间
    socket.on('leave', function (roomName) {
        // 获取进入房间在rooms中的索引
        const index = rooms.indexOf(roomName);
        if (index !== -1) {
            socket.leave(roomName);
            rooms.splice(index, 1); // 从rooms数组中删除该房间

            socket.send({
                user: SYSTEM,
                content: `你已经离开${roomName}房间了`,
                createAt: new Date().toLocaleString()
            });

            socket.emit('leaved', roomName);
        }
    });
    // 
    socket.on('getAllMsgs', function () {
        let latest = msgArr.slice(msgArr.length - 20);
        socket.emit('allMsgs', latest);
    });
});

// 划分一个新的命名空间，默认是/
/* io.of('/music').on('connection', function(socket) {
    socket.on('message', function(msg) {
        console.log('music已接收到消息', msg);
        socket.send('这里是music的服务器');
    })
}); */

server.listen(3000);


