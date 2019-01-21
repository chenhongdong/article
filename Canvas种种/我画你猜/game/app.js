const express = require('express');
const app = express();

// 设置静态文件夹
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 定义常量用来区分是绘图还是聊天
const LINE = 0;
const MESSAGE = 1;

let userList = ['皮卡丘', '比比鸟', '巴大蝴', '妙蛙种子', '小火龙', '杰尼龟'];

io.on('connection', socket => {
    // 随机创建一个用户并通知所有人
    const user = userList[Math.floor(Math.random() * userList.length)];
    const message = `欢迎${user}进入游戏`;

    let data = {};
    data.type = MESSAGE;
    data.sender = '系统';
    data.message = message
    io.emit('message', JSON.stringify(data));

    socket.on('message', msg => {
        let data = JSON.parse(msg);

        if (data.type === MESSAGE) {
            data.sender = user;
        }
        io.emit('message', JSON.stringify(data));
    });
});

server.listen(8888);