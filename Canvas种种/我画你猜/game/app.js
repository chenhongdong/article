const express = require('express');
const app = express();

// 设置静态文件夹
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 定义常量用来区分是绘图还是聊天
const LINE = 0;
const MESSAGE = 1;
const GAME = 2;

let userList = ['皮卡丘', '比比鸟', '巴大蝴', '妙蛙种子', '小火龙', '杰尼龟'];


// 游戏状态和游戏逻辑
const WAITTING = 0;
const START = 1;
const OVER = 2;
const RESTART = 3;

let player = 0;
let wordsList = ['苹果', '运动鞋', '火箭', '足球', '小黄人', '汽车', '小鸟'];
let currentAnswer;
let currentState = WAITTING;
let timer;
// 连接的客户端数量
let len = 0;


io.on('connection', socket => {
    // 随机创建一个用户并通知所有人
    const user = userList[Math.floor(Math.random() * userList.length)];
    const message = `欢迎${user}进入游戏`;

    let data = {};
    data.type = MESSAGE;
    data.sender = '系统';
    data.message = message
    io.emit('message', JSON.stringify(data));

    // 把游戏的消息通知所有人
    let game = {};
    game.type = GAME;
    game.state = WAITTING;
    io.emit('message', JSON.stringify(game));

    // 遍历客户端的连接
    io.clients((err, client) => {
        if (err) throw err;
        len = client.length;
    });

    // 当前状态为等待并且连接数超过两个的时候才开始游戏
    console.log(currentState);
    console.log(len);
    if (currentState === WAITTING && len > 2) {
        startGame(socket);
    }

    socket.on('message', msg => {
        let data = JSON.parse(msg);

        if (data.type === MESSAGE) {
            data.sender = user;
        }
        console.log(data);
        io.emit('message', JSON.stringify(data));

        // 判断是不是有玩家答对了
        if (currentState === START && data.message === currentAnswer) {
            let game = {};
            game.type = GAME;
            game.answer = currentAnswer;
            game.winner = user;
            game.state = OVER;
            io.emit('message', JSON.stringify(game));

            currentState = WAITTING;

            clearTimeout(timer);
        }

        // 重新开始
        if (data.state === RESTART && data.type === GAME) {
            startGame(socket);
        }
    });
});

function startGame(socket) {
    // 分配玩家
    player = (player + 1) % len;
    // 随机答案
    let random = Math.floor(Math.random() * wordsList.length);
    currentAnswer = wordsList[random];

    // 通知
    let data = {};
    data.type = GAME;
    data.isPlayer = false;
    data.state = START;
    io.emit('message', JSON.stringify(data));

    // 遍历
    let count = 0;
    io.clients((err, client) => {
        client.forEach(item => {
            if (count === player) {
                let game = {};
                game.type = GAME;
                game.state = START;
                game.isPlayer = true;
                game.answer = currentAnswer;
                // 这条消息只有绘图的玩家才能看到
                socket.send(JSON.stringify(game));
            }
            count++;
        });
    });

    // 1分钟
    timer = setTimeout(() => {
        let obj = {};
        obj.type = GAME;
        obj.state = OVER;
        obj.winner = '没有人啊！';
        obj.answer = currentAnswer;
        io.emit('message', JSON.stringify(obj));

    }, 60 * 1000);

    currentState = START;
}

server.listen(8888);