const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const SYSTEM = '系统';
// 设置一些颜色的数组，让每次进入聊天的用户颜色都不一样
let userColor = ['#00a1f4', '#0cc', '#f44336', '#795548', '#e91e63', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffc107', '#607d8b', '#ff9800', '#ff5722'];

io.on('connection', socket => {
    let username;
    socket.on('message', msg => {
        if (username) {
            io.emit('message', {
                user: username,
                content: msg,
                createAt: new Date().toLocaleString()
            });
        } else {
            username = msg;
            socket.broadcast.emit('message', {
                user: '系统',
                content: `${username}加入了聊天！`,
                createAt: new Date().toLocaleString()
            });
        }
    });
});




// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到/socket.io/socket.io.js文件)
server.listen(4000);