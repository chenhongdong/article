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
// 监听客户端与服务端的连接
io.on('connection', function(socket) {
    // 用户名，默认为undefined
    let username;
    socket.on('message', function(msg) {
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
                    // 私聊的用户不在线的话，自己说一下
                    socket.send({
                        user: SYSTEM,
                        content: '您私聊的用户不在线',
                        createAt: new Date().toLocaleString()
                    });
                }
            } else {
                // 服务器要向所有的客户端进行广播
                io.emit('message', {
                    user: username,
                    content: msg,
                    createAt: new Date().toLocaleString()
                });
            }
        } else {
            // 如果第一次进来没有用户名，就把msg当做用户名
            username = msg;
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
    socket.on('join', function(roomName) {
        // socket.join表示进入某个房间
        socket.join(roomName);
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


