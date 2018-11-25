const express = require('express');
const app = express();

app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 设置常量
const LINE_SEGMENT = 0;
const CHAT_MESSAGE = 1;

io.on('connection', socket => {
    console.log('服务端连接成功');
    let message = `欢迎${socket.id}加入《我画你猜》游戏当中`;

    // + 设置数据
    let data = {};
    data.dataType = CHAT_MESSAGE;
    data.sender = '系统';
    data.message = message;

    io.emit('message', JSON.stringify(data));

    socket.on('message', msg => {
        // - let displayMsg = `${socket.id} 说： ${msg}`;
        console.log(`接收到： ${msg} 来自于：${socket.id}`);

        // + 
        let data = JSON.parse(msg);
        if (data.dataType === CHAT_MESSAGE) {
            data.sender = socket.id;
        }
        io.emit('message', JSON.stringify(data));
    });

});

server.listen(9999);