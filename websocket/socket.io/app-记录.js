const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    // socket.id是后台生成的id
    // socket.broadcast.emit('message', `${socket.id}加入了群聊`);

    // rooms为当前用户的所有房间
    // username为用户名
    let rooms = [], username;
    // 监听客户端发过来的消息
    socket.on('message', msg => {
        const roomsLen = rooms.length;

        if (username) {
            // 如果说在某个房间内的话，那么说的话只能在该房间内可以看到
            if (roomsLen) {
                for (let i = 0; i < roomsLen; i++) {
                    io.in(rooms[i]).emit('message', msg);
                }
            } else {
                // 如果此用户不在任何一个房间的话，就全局广播
                io.emit('message', msg);
            }
        } else {
            // 如果还没有设置用户名，那这就是该用户的第一次发言
            username = msg;
            socket.broadcast.emit('message', `${username}加入了群聊`);
        }
    });

    // 监听客户端发过来的join类型消息,参数是要加入的房间名
    socket.on('join', room => {
        // let oldIndex = rooms.findIndex(item => item === room);
        let oldIndex = rooms.indexOf(room);
        // 进来先看看在不在房间，如果不在房间的话就join进入房间
        if (oldIndex === -1) {
            // 相当于这个socket在服务端进入了某个房间
            socket.join(room);
            rooms.push(room);
        }
    });

    // 客户端告诉服务器说要离开的时候，则如果客户端正好在房间内，就离开该房间即可
    socket.on('leave', room => {
        let oldIndex = rooms.indexOf(room);
        if (oldIndex !== -1) {
            socket.leave(room);
            rooms.splice(oldIndex, 1);
        }
    });
});

io.of('/goods').on('connection', socket => {
    console.log('新闻服务端已经连接');
    // 监听客户端发来的消息
    socket.on('message', msg => {
        console.log(msg);
        // 向全世界的所有人广播
        io.of('/goods').emit('message', msg);
    })
});

server.listen(3000);


/* 
    Socket.prototype.send = function() {
        
    }
*/