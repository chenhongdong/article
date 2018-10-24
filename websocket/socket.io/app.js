const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 用来保存对应的socket
let socketObj = {};

const SYSTEM = '系统';
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

io.on('connection', socket => {
    // 记录用户名，用来记录是不是第一次进入
    let username, color, rooms = [];

    socket.on('message', msg => {
        if (username) {
            let private = msg.match(/@([^ ]+) (.+)/);

            if (private) {
                let user = private[1];
                let content = private[2];
                let toUser = socketObj[user];
                console.log(toUser);
                if (toUser) {
                    toUser.send({
                        user: username,
                        color,
                        content,
                        createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                    });
                } else {
                    console.log(user);
                    socket.send({
                        user: SYSTEM,
                        color,
                        content: `${user}不存在，无法进行聊天`
                    });
                }
            } else {
                // 如果不是私聊的
                // 向所有人广播
                io.emit('message', {
                    user: username,
                    color,
                    content: msg,
                    createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
                });
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
                createAt: `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
            });
        }
    });

    socket.on('join', room => {
        
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



// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到socket.io.js文件)
server.listen(4000);