const express = require('express');
const app = express();

app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('服务器连接成功');

    socket.on('message', msg => {
        console.log(msg);
        socket.send({
            user: '系统',
            content: msg,
            createAt: new Date().toLocaleString()
        });
    });
});

// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到socket.io.js文件)
server.listen(4000);