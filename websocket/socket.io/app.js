const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    socket.send('你是天后')
    socket.on('message', msg => {
        socket.send('server收到的： ' + msg)
    });
});

io.of('/news').on('connection', socket => {
    console.log('新闻服务端已经连接');
    // 监听客户端发来的消息
    socket.on('message', msg => {
        console.log(msg);
        // 向全世界的所有人广播
        io.of('/news').emit('message', msg);
    })
});

server.listen(3000);


/* 
    Socket.prototype.send = function() {
        
    }
*/