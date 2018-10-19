const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

// 访问/news
app.get('/news', function(req, res) {
    res.setHeader('Content-Type', 'text/html;charset=utf8');
    res.sendFile(path.resolve(__dirname, './news.html'));
});

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

// 划分一个新的命名空间，默认是/
io.of('/news').on('connection', function(socket) {
    socket.on('message', function(msg) {
        console.log('news已接收到消息', msg);
        socket.send('这里是news的服务器');
    })
});

server.listen(3000);