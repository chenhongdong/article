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
    // 将聊天区域的滚动条设置到最新内容的位置
+    list.scrollTop = list.scrollHeight;
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
在群里大家都知道@一下就代表这条消息是专属被@的那个人的，我们在消息列表list中点击对方的用户名，就可以进行私聊了，所以废话不多说，开写吧
#### @一下
```
// index.js文件

// 私聊的方法
function privateChat(event) {
    let target = event.target;
    // 拿到对应的用户名
    let user = target.innerHTML;
    // 只有class为user的才是目标元素
    if (target.className === 'user') {
        socket.emit('message', `@${user} `);
    }
}
// 点击进行私聊
list.onclick = function(event) {
    privateChat(event);
};
```
#### 服务端处理私聊
```
// app.js文件

// 用来保存对应的socket，就是记录对方的socket实例
let socketObj = {};

io.on('connection', socket => {
    let username;
    socket.on('message', msg => {
        if (username) {
            // 正则判断消息是否为私聊专属
            let private = msg.match(/@([^ ]+) (.+)/);

            if (private) {  // 私聊消息
                let toUser = private[1];
                let content = private[2];
                let toSocket = socketObj[toUser];

                if (toSocket) {
                    toSocket.send({
                        user: username,
                        content,
                        createAt: new Date().toLocaleString()
                    });
                }
            } else {    // 公聊消息
                io.emit('message', {
                    user: username,
                    content: msg,
                    createAt: new Date().toLocaleString()
                });
            }

        } else {
            ...省略
            // 把socketObj对象上对应的用户名赋为一个socket
            /*
                如： socketObj = {
                        '周杰伦': socket
                    }
            */
            socketObj[username] = socket;
        }
    });
});
```
写到这里，我们已经完成了群聊和私聊的功能了，可喜可贺，非常了不起了已经，但是不能傲娇，我们再完善一些**小细节**

现在所有用户名和发送消息的气泡都是一个颜色，其实这样也不好区分用户之间的差异

SO，我们来改下颜色的部分
### 加入指定房间(群)

#### 进入房间

#### 离开房间

### 小Tips
- socket.send()发送消息是为了给自己看的
- io.emit()发送消息是给所有人看的
- socket.broadcast.emit()发送消息除了自己都能看到