const express = require('express');
const app = express();

app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);
// 监听客户端与服务端的连接
io.on('connection', function(socket) {
    socket.send('欢迎光临');
    socket.on('message', function(msg) {
        console.log(msg);
        // socket.send('服务器说的是： 欢迎光临' );
    });
});

server.listen(3000);