const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);

app.get('/', function(req, res) {
    console.log(res);
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8888);

const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({ port: 7777 });
wss.on('connection', function(socket) {
    console.log('连接成功');
    socket.on('message', function(msg) {
        console.log('接收到客户端消息： ' + msg);
        socket.send('服务器响应： ' + msg);
    });
});