const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('客户端已经链接，我这里是服务端');
    socket.send('你是天后')
    socket.on('message', msg => {
        socket.send('server收到的： ' + msg)
    });
});

server.listen(80);