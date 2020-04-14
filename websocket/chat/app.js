const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 用来保存对应的socket
let socketObj = {};
// 上来记录一个socket.id用来查找对应的用户
let mySocket = {};
// 创建一个数组用来保存最近的20条消息记录，真实项目中会存到数据库中
let msgHistory = [];

const SYSTEM = '系统';
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

io.on('connection', socket => {
    // 这是所有连接到服务端的socket.id
    mySocket[socket.id] = socket;
    console.log('id', socket.id);
    socket.emit('getId', socket.id);

    // 记录用户名，用来记录是不是第一次进入
    let username, color, rooms = [];
    // 监听客户端发过来的消息
    socket.on('message', msg => {
        if (username) {
            let private = msg.match(/@([^ ]+) (.+)/);

            if (private) {  // 私聊
                let user = private[1];
                let content = private[2];
                let toSocket = socketObj[user];
                // 对方的socket存在，就发送消息
                if (toSocket) {
                    console.log('私聊');
                    toSocket.send({
                        user: username,
                        color,
                        content,
                        createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
                    });
                    socket.send({
                        user: username,
                        color,
                        content,
                        createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
                    });
                }
            } else {
                // 房间内和房间外都是一样的消息对象，直接存成msgObj变量使用
                let msgObj = {
                    user: username,
                    color,
                    content: msg,
                    id: socket.id,
                    createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
                };

                // 如果rooms数组有值，就代表有用户进入了房间
                if (rooms.length) {
                    // 用来存储进入房间内的对应的socket.id
                    let socketJson = {};

                    rooms.forEach(room => {
                        // 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        Object.keys(roomSockets).forEach(socketId => {
                            console.log('socketId', socketId);
                            // 进行一个去重，在socketJson中只有对应唯一的socketId
                            if (!socketJson[socketId]) {
                                socketJson[socketId] = 1;
                            }
                        });
                    });

                    // 遍历socketJson，在mySocket里找到对应的id，然后发送消息
                    Object.keys(socketJson).forEach(socketId => {
                        mySocket[socketId].emit('message', msgObj);
                    });
                } else {
                    // 如果不是私聊的
                    // 向所有人广播
                    io.emit('message', msgObj);

                    // 把发送的消息push到msgHistory中
                    // 真实情况是存到数据库里的
                    msgHistory.push(msgObj);
                }
            }
        } else {
            // 如果是第一次进入的话，就将输入的内容当做用户名
            username = msg;
            color = shuffle(userColor)[0];
            // 这里保存一份对应的socket用户,以便之后可以找到该用户
            socketObj[username] = socket;
            // 向除了自己的所有人广播，毕竟进没进入自己当然是知道的，没必要跟自己再说
            socket.broadcast.emit('message', {
                user: SYSTEM,
                color,
                content: `${username}加入了聊天`,
                createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
            });
        }
    });
    // 监听进入房间的事件
    socket.on('join', room => {
        // 判断一下用户是否进入了房间，如果没有才让其进到房间里
        if (username && rooms.indexOf(room) === -1) {
            // socket.join表示进入某个房间
            socket.join(room);
            rooms.push(room);
            // 这里发送个joined事件，让前端监听后，控制房间按钮
            socket.emit('joined', room);
            // 通知一下自己
            socket.send({
                user: SYSTEM,
                color,
                content: `你已加入到${room}战队`,
                createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
            });
        }
    });
    // 监听离开房间的事件
    socket.on('leave', room => {
        // index为该房间在数组rooms中的索引，方便删除
        let index = rooms.indexOf(room);
        if (index !== -1) {
            socket.leave(room); // 离开该房间
            rooms.splice(index, 1); // 删掉该房间
            // 这里发送个leaved事件，让前端监听后，控制房间按钮
            socket.emit('leaved', room);
            // 通知一下自己
            socket.send({
                user: SYSTEM,
                color,
                content: `你已经离开${room}战队`,
                createAt: `${addZero(new Date().getHours())}:${addZero(new Date().getMinutes())}:${addZero(new Date().getSeconds())}`
            });
        }
    });

    // 监听获取历史消息的事件
    socket.on('getHistory', () => {
        // 通过数组的slice方法截取最新的20条消息
        if (msgHistory.length) {
            let history = msgHistory.slice(msgHistory.length - 20);
            socket.emit('history', history);
        }
    });
});


// 乱序排列
function shuffle(arr) {
    let len = arr.length, random;
    while (0 !== len) {
        random = (Math.random() * len--) >>> 0;			// 右移位运算符向下取整
        [arr[len], arr[random]] = [arr[random], arr[len]];	// 解构赋值实现变量互换
    }
    return arr;
}
// 时间补零
function addZero(n) {
    return n < 10 ? '0' + n : '' + n;
}



// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到/socket.io/socket.io.js文件)
server.listen(4000);