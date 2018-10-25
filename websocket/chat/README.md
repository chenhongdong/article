## 聊天室的开发过程
### 建立连接
#### 客户端
```
let socket = io();
// 监听与服务端的连接
socket.on('connect', () => {
    console.log('连接成功');
});
```
#### 服务端
```
const express = require('express');
const app = express();

app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('服务端连接成功');
});

server.listen(4000);
```
### 发送消息
按钮，输入框，列表Ul这些都齐全了，那就开始发送消息吧

通过socket.emit('message')来发送消息给服务端
```
// index.js文件

// 列表list，输入框content，按钮sendBtn
let list = document.getElementById('list'),
    input = document.getElementById('input'),
    sendBtn = document.getElementById('sendBtn');

// 点击按钮发送消息
sendBtn.onclick = send;

// 发言的方法
function send() {
    let value = input.value;
    if (value) {
        // 发送消息给服务器
        socket.emit('message', value);
        input.value = '';
    } else {
        alert('输入的内容不能为空！');
    }
}
```
#### 输入文字发送内容

#### 服务端处理消息

### 判断是不是有username

#### username不存在

#### username存在

### 添加私聊

#### @一下

#### 服务端处理私聊

### 加入指定房间(群)

#### 进入房间

#### 离开房间

### 小Tips
- socket.send()发送消息是为了给自己看的
- io.emit()发送消息是给所有人看的
- socket.broadcast.emit()发送消息除了自己都能看到