const express = require('express');
const app = express();
// 设置静态文件夹，会默认找当前目录下的index.html文件当做访问的页面
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

// 用来保存对应的socket
let socketObj = {};

io.on('connection', socket => {
    // 记录用户名，用来记录是不是第一次进入
    let username;

    socket.on('message', msg => {
        if (username) {
            // 向所有人广播
            io.emit('message', {
                user: username,
                content: msg,
                createAt: new Date().toLocaleString()
            });
        } else {
            // 如果是第一次进入的话，就将输入的内容当做用户名
            username = msg;
            // 这里保存一份对应的socket用户,以便之后可以找到该用户
            socketObj[username] = msg;
            // 向所有人广播
            io.emit('message', {
                user: '系统',
                content: `${username}加入了聊天`,
                createAt: new Date().toLocaleString()
            });
        }
    });
});

// 这里记住要用server去监听端口，而不是app.listen去监听(防止找不到socket.io.js文件)
server.listen(4000);