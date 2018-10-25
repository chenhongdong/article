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
```
// index.js文件

function enterSend(event) {
    let key = event.keyCode;

    if (key === 13) {
        send();
    }
}

input.onkeydown = function(event) {
    enterSend(event);
}
```
#### 服务端处理消息
```
// app.js文件
...省略

io.on('connection', socket => {
    // 监听客户端发过来的消息
+    socket.on('message', msg => {
        // 服务端发送message事件，把msg消息再发送给客户端
+        io.emit('message', {
+            user: '系统',
+            content: msg,
+            createAt: new Date().toLocaleString()
+        });
+    });
});
```
#### 客户端渲染消息
```
// index.js文件

// 监听message事件来接收服务端发来的消息
+ socket.on('message', data => {
+     let li = document.createElement('li');
+     li.className = 'list-group-item';
+     li.innerHTML = `<p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
                    <p class="content" style="background-color: ${data.color}">${data.content}</p>`;
    // 将li添加到list列表中
+     list.appendChild(li);
+ });
```

### 判断是不是有username
这里我们可以知道，当用户是第一次进来的时候，是没有用户名的，需要在设置之后才会显示对应的名字，那么我们先来写下第一次进入设置用户名的情况
#### username不存在
```
const SYSTEM = '系统';

io.on('connection', socket => {
    // 记录用户名，用来记录是不是第一次进入
    let username;
    socket.on('message', msg => {
        if (username) {

        } else {
            // 如果是第一次进入的话，就将输入的内容当做用户名
            username = msg;
            // 向除了自己的所有人广播，毕竟进没进入自己当然是知道的，没必要跟自己再说
            socket.broadcast.emit('message', {
                user: SYSTEM,
                content: `${username}加入了聊天！`,
                createAt: new Date().toLocaleString()
            });
        }
    });
});
```
#### username存在
```
const SYSTEM = '系统';

io.on('connection', socket => {
    // 记录用户名，用来记录是不是第一次进入
    let username;
    socket.on('message', msg => {
        if (username) {
            io.emit('message', {
                user: username,
                content: msg,
                createAt: new Date().toLocaleString()
            });
        } else {
            // 如果是第一次进入的话，就将输入的内容当做用户名
            username = msg;
            // 向除了自己的所有人广播，毕竟进没进入自己当然是知道的，没必要跟自己再说
            socket.broadcast.emit('message', {
                user: SYSTEM,
                content: `${username}加入了聊天！`,
                createAt: new Date().toLocaleString()
            });
        }
    });
});
```
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