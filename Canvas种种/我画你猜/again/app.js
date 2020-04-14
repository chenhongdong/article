const express = require('express');
const app = express();
// 设置静态文件夹
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 常量用来区分是线段还是聊天
const LINE = 0;
const MESSAGE = 1;
// ## 构建多人游戏
const GAME_LOGIC = 2;
const WAITING = 0;
const GAME_START = 1;
const GAME_OVER = 2;
const GAME_RESTART = 3;

let player = 0;

const wordsList = ['苹果', '愤怒的小鸟', '火箭', '足球'];
let currentAnswer;
let currentState = WAITING;
let gameOverTimeout;
let playerNum = 0;

// 用户列表
const userList = ['皮卡丘', '伊布', '比比鸟', '巴大蝴', '小火龙', '妙蛙种子', '杰尼龟', '乘龙'];

io.on('connection', socket => {
    // 随机创建用户
    const user = userList[Math.floor(Math.random() * userList.length)];
    let message = `欢迎${user}来到《我画你猜》的游戏世界！`;
    // 获取所有连接的客户端数量
    io.clients((err, client) => {
        if (err) throw err;
        playerNum = client.length;
    });

    // ### 通过socket发送绘图数据
    let data = {};
    data.type = MESSAGE;
    data.sender = '系统';
    data.message = message;
    io.emit('message', JSON.stringify(data));
    // ### 通过socket发送绘图数据
    // ## 构建多人游戏
    // 发送游戏状态给所有玩家
    let gameData = {};
    gameData.type = GAME_LOGIC;
    gameData.gameState = WAITING;
    io.emit('message', JSON.stringify(gameData));

    // 如果有两个人以上的连接，就开始游戏
    console.log('当前状态', currentState);
    if (currentState === WAITING && playerNum >= 2) {
        startGame(socket);
    }
    // ## 构建多人游戏

    socket.on('message', msg => {
        // 处理客户端发来的消息数据
        let data = JSON.parse(msg);
        if (data.type === MESSAGE) {
            data.sender = user;
        }
        io.emit('message', JSON.stringify(data));

        // ## 构建多人游戏
        // 检测是否猜中答案，走这里表示猜对了
        if (currentState === GAME_START && data.message === currentAnswer) {
            let gameData = {};
            gameData.type = GAME_LOGIC;
            gameData.gameState = GAME_OVER
            gameData.winner = user;
            gameData.answer = currentAnswer;

            io.emit('message', JSON.stringify(gameData));

            clearTimeout(gameOverTimeout);
        }

        if (data.type === GAME_LOGIC && data.gameState === GAME_RESTART) {
            startGame(socket);
        }
        // ## 构建多人游戏
    });
});


function startGame(socket) {
    // 选择一个玩家让他来画画
    player = (player + 1) % playerNum;
    // 选择一个答案
    let random = Math.floor(Math.random() * wordsList.length);
    currentAnswer = wordsList[random];

    // 所有玩家开始游戏
    let data = {}
    data.type = GAME_LOGIC;
    data.gameState = GAME_START;
    data.isPlayer = false;
    io.emit('message', JSON.stringify(data));

    // 游戏开始，玩家依次回答
    let index = 0;
    io.clients((err, client) => {
        if (err) throw err;
        client.forEach(item => {
            if (index === player) {
                let data2 = {};
                data2.type = GAME_LOGIC;
                data2.gameState = GAME_START;
                data2.answer = currentAnswer;
                data2.isPlayer = true;
                socket.send(JSON.stringify(data2));
            }
            index++;
        });
    });

    // 1分钟后游戏结束
    gameOverTimeout = setTimeout(() => {
        let newData = {};
        newData.gameState = GAME_OVER;
        newData.winner = '没有';
        newData.answer = currentAnswer;
        io.emit(JSON.stringify(newData));

        currentState = WAITING;
    }, 60 * 1000);

    currentState = GAME_START;
}

server.listen(9000);