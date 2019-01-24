const express = require('express');
const app = express();

app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 随机设置用户的名称
let nameList = ['皮卡丘', '小火龙', '妙蛙种子', '杰尼龟', '卡比兽', '鲤鱼王', '暴鲤龙', '伊布', '比比鸟', '烈雀', '大岩蛇', '小拳石', '宝石海星', '墨海马', '角金鱼', '雷丘', '电击兽', '臭臭花', '霸王花', '口袋花', '勇吉拉', '鬼斯通', '耿鬼', '火爆猴', '艾比郎', '沙瓦浪', '末入蛾', '毛球', '怪力', '迷你龙', '乘龙', '胡地', '铁甲暴龙', '尼多王', '鸭嘴火龙', '快龙', '超梦', '梦幻', '哈克龙', '海星星', '波克比'];
let user = nameList[Math.floor(Math.random() * nameList.length)];
// 设置常量
const LINE_SEGMENT = 0;
const CHAT_MESSAGE = 1;
const GAME_LOGIC = 2;
// ++ 游戏逻辑状态常量
const WAITING_TO_START = 0;
const GAME_START = 1;
const GAME_OVER = 2;
const GAME_RESTART = 3;

// ++ 当前进行绘制的玩家的索引
let palyerTurn = 0;
let wordsList = ['苹果', '火箭', '鸡蛋', '小鸟'];
let currentAnswer;
let currentGameState = WAITING_TO_START;
let gameOverTimeout;

// 连接数
let len = 0;

io.on('connection', socket => {
    // 随机设置用户名
    let nameList = ['皮卡丘', '比比鸟', '巴大蝴','妙蛙种子', '小火龙', '杰尼龟'];
    let user = nameList[Math.floor(Math.random() * nameList.length)];

    io.clients((err, client) => {
        if (err) throw err;
        len = client.length;
    });
    let message = `欢迎 “${user}” 加入《我画你猜》游戏当中`;

    // + 设置数据
    let data = {};
    data.dataType = CHAT_MESSAGE;
    data.sender = '系统';
    data.message = message;

    io.emit('message', JSON.stringify(data));

    // ++ 发送游戏状态给所有玩家
    let gameData = {};
    gameData.dataType = GAME_LOGIC;
    gameData.gameState = WAITING_TO_START;
    io.emit('message', JSON.stringify(gameData));

    // ++ 如果有两个以上的连接接入，就开始游戏
    if (currentGameState === WAITING_TO_START && len >= 2) {
        startGame(socket);
    }


    socket.on('message', msg => {
        // - let displayMsg = `${socket.id} 说： ${msg}`;
        // console.log(`接收到： ${msg} 来自于：${socket.id}`);

        // + 
        let data = JSON.parse(msg);
        if (data.dataType === CHAT_MESSAGE) {
            data.sender = user;
        }
        
        io.emit('message', JSON.stringify(data));

        // ++ 检测是否猜中答案
        if (currentGameState === GAME_START && data.message === currentAnswer) {
            let gameData = {};
            gameData.dataType = GAME_LOGIC;
            gameData.gameState = GAME_OVER;
            gameData.winner = user;
            gameData.answer = currentAnswer;
            io.emit('message', JSON.stringify(gameData));

            currentGameState = WAITING_TO_START;

            // 清除定时器
            clearTimeout(gameOverTimeout);
        }

        if (data.dataType === GAME_LOGIC && data.gameState === GAME_RESTART) {
            startGame(socket);
        }
    });

});



// 开始游戏方法
function startGame(socket) {
    // 选择一个玩家让他进行绘制
    palyerTurn = (palyerTurn + 1) % len;

    // 选择一个答案
    let answerIndex = Math.floor(Math.random() * wordsList.length);
    currentAnswer = wordsList[answerIndex];

    console.log(currentAnswer);

    // 所有玩家开始游戏
    let gameData1 = {};
    gameData1.dataType = GAME_LOGIC;
    gameData1.gameState = GAME_START;
    gameData1.isTurnToDraw = false;
    io.emit('message', JSON.stringify(gameData1));

    // 游戏开始，玩家依次回答
    let index = 0;
    io.clients((err, client) => {
        client.forEach(() => {
            if (index === palyerTurn) {
                let gameData2 = {}; // 需要绘图的玩家
                gameData2.dataType = GAME_LOGIC;
                gameData2.gameState = GAME_START;
                gameData2.answer = currentAnswer;
                gameData2.isTurnToDraw = true;
                socket.send(JSON.stringify(gameData2));
            }
            index++;
        });
    });

    // 1分钟后游戏结束
    gameOverTimeout = setTimeout(function() {
        let gameData = {};
        gameData.dataType = GAME_LOGIC;
        gameData.gameState = GAME_OVER;
        gameData.winner = '没有人';
        gameData.answer = currentAnswer;
        io.emit('message', JSON.stringify(gameData));

        currentGameState = WAITING_TO_START;
    }, 60000);

    currentGameState = GAME_START;
}

server.listen(9999);