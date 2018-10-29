const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

let socketObj = {};
let mySocket = {};
let msgHistory = [];

const SYSTEM = '系统';
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

// 乱序排列
function shuffle(arr) {
    let len = arr.length, random;
    while (0 !== len) {
        random = (Math.random() * len--) >>> 0;			// 右移位运算符向下取整
        [arr[len], arr[random]] = [arr[random], arr[len]];	// 解构赋值实现变量互换
    }
    return arr;
}

io.on('connection', socket => {
    let username;
    let color;
    let rooms = [];
    mySocket[socket.id] = socket;

    socket.on('message', msg => {
        if (username) {
            let private = msg.match(/@([^ ]+) (.+)/);
            if (private) {
                // 私聊的用户，正则匹配的第一个分组
                let other = private[1];
                // 私聊的内容，正则匹配的第二个分组
                let content = private[2];
                // 从socketObj中获取私聊用户的socket
                let toSocket = socketObj[other];
               
                if (toSocket) {
                    // 向私聊的用户发消息
                    toSocket.send({
                        user: username,
                        color,
                        content: content,
                        createAt: new Date().toLocaleString()
                    });
                }
            } else {
                
                if (rooms.length) {
                    let targetSocket = {};
                    rooms.forEach(room => {
                        let roomSockets = io.sockets.adapter.rooms[room].sockets;
                        Object.keys(roomSockets).forEach(socketId => {
                            if (!targetSocket[socketId]) {
                                targetSocket[socketId] = 1;
                            }
                        });
                    });

                    Object.keys(targetSocket).forEach(socketId => {
                        mySocket[socketId].emit('message', {
                            user: username,
                            color,
                            content: msg,
                            createAt: new Date().toLocaleString()
                        });
                    });
                } else {
                    io.emit('message', {
                        user: username,
                        color,
                        content: msg,
                        createAt: new Date().toLocaleString()
                    });

                    msgHistory.push({
                        user: username,
                        color,
                        content: msg,
                        createAt: new Date().toLocaleString()
                    });
                    console.log(msgHistory);
                }
            }
        } else {
            username = msg;
            socketObj[username] = socket;
            // 随机取出颜色数组中的第一个，分配给对应用户
            color = shuffle(userColor)[0];
            socket.broadcast.emit('message', {
                user: SYSTEM,
                color,
                content: `${username}加入了聊天！`,
                createAt: new Date().toLocaleString()
            });
        }
    });

    socket.on('join', room => {
        if (rooms.indexOf(room) === -1) {
            socket.join(room);
            rooms.push(room);

            socket.emit('joined', room);

            socket.send({
                user: SYSTEM,
                color,
                content: `你已加入${room}战队`,
                createAt: new Date().toLocaleString()
            });
        }
    });

    socket.on('leave', room => {
        let index = rooms.indexOf(room);

        if (index !== -1) {
            socket.leave(room);
            rooms.splice(index, 1);

            socket.emit('leaved', room);

            socket.send({
                user: SYSTEM,
                color,
                content: `你已离开${room}战队`,
                createAt: new Date().toLocaleString()
            });
        }
    });

    socket.on('getHistory', () => {
        if (msgHistory.length) {
            let history = msgHistory.slice(msgHistory.length - 20);
            socket.emit('history', history);
        }
    });
});




// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到/socket.io/socket.io.js文件)
server.listen(4000);