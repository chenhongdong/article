const express = require('express');
const app = express();
// 设置静态文件夹
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 用户列表
const userList = ['皮卡丘', '伊布', '比比鸟', '巴大蝴', '小火龙', '妙蛙种子', '杰尼龟', '乘龙'];


io.on('connection', socket => {
    // 随机创建用户
    const user = userList[Math.floor(Math.random() * userList.length)];

    let message = `欢迎${user}来到《我画你猜》的游戏世界！`;

    io.emit('message', message);
});

server.listen(9000);