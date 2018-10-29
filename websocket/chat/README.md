## 聊天室的开发过程
```
// index.html文件

// 引入bootstrap.css文件
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css">
<style>
/*这里简单写下用户名和发送内容的样式*/
.user { color: #00a1f4; cursor: pointer; }
.content { display: inline-block; padding: 6px 10px; background-color: #00a1f4; border-radius: 8px; color: #fff; }
</style>

// 主内容结构
<div class="container" style="margin-top: 30px;">
    <div class="row">
        <div class="col-xs-12">
            <div class="panel panel-info">
                <div class="panel-heading">
                    <h4 class="text-center">放轻松，聊聊天</h4>
                    <div class="row">
                        <div class="col-xs-6 text-center">
                            <button id="join-Jay" class="btn btn-primary" onclick="join('Jay')">进入杰伦战队群</button>
                            <button id="leave-Jay" class="btn btn-primary" onclick="leave('Jay')" style="display: none;">离开杰伦战队群</button>
                        </div>
                        <div class="col-xs-6 text-center">
                            <button id="join-Tse" class="btn btn-success" onclick="join('Tse')">进入霆锋战队群</button>
                            <button id="leave-Tse" class="btn btn-success" onclick="leave('Tse')" style="display: none;">离开霆锋战队群</button>
                        </div>
                    </div>
                </div>
                <div class="panel-body">
                    <ul id="list" class="list-group" style="height: 300px;overflow: auto;"></ul>
                </div>
                <div class="panel-footer">
                    <div class="row">
                        <div class="col-xs-10">
                            <input type="text" class="form-control" id="input">
                        </div>
                        <div class="col-xs-1">
                            <button class="btn btn-info" id="sendBtn">发送</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- 引入socket.io.js -->
<script src="/socket.io/socket.io.js"></script>
<script src="./index.js"></script>
```
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
我们一直在截图效果上看到了两个群的按钮，看到字面意思就能知道是干嘛的

下面我们再来，继续撸，马上就要完成大作了
#### 进入房间
```
// index.js文件
...省略

// 进入房间的方法
+ function join(room) {
+    socket.emit('join', room);
+ }
// 监听是否已进入房间
// 如果已进入房间，就显示离开房间按钮
+ socket.on('joined', room => {
+    document.getElementById(`join-${room}`).style.display = 'none';
+    document.getElementById(`leave-${room}`).style.display = 'inline-block';
+ });

// 离开房间的方法
+ function leave(room) {
    socket.emit('leave', room);
+ }
// 监听是否已离开房间
// 如果已离开房间，就显示进入房间按钮
+ socket.on('leaved', room => {
+    document.getElementById(`leave-${room}`).style.display = 'none';
+    document.getElementById(`join-${room}`).style.display = 'inline-block';
+ });
```
#### 离开房间
```
// app.js文件
...省略
io.on('connection', socket => {
    ...省略
    io.on('message', msg => {
        ...省略
    });
    // 监听进入房间的事件
+   socket.on('join', room => {
+       // 判断一下用户是否进入了房间，如果没有才让其进到房间里
+       if (username && rooms.indexOf(room) === -1) {
            // socket.join表示进入某个房间
+           socket.join(room);
+            rooms.push(room);
            // 这里发送个joined事件，让前端监听后，控制房间按钮
+           socket.emit('joined', room);
            // 通知一下自己
+           socket.send({
+               user: SYSTEM,
+               color,
+               content: `你已加入${room}战队`,
+               createAt: new Date().toLocaleString()
+           });
+       }
+   });
    // 监听离开房间的事件
+   socket.on('leave', room => {
        // index为该房间在数组rooms中的索引，方便删除
+       let index = rooms.indexOf(room);
+       if (index !== -1) {
+           socket.leave(room); // 离开该房间
+           rooms.splice(index, 1); // 删掉该房间
            // 这里发送个leaved事件，让前端监听后，控制房间按钮
+           socket.emit('leaved', room);
            // 通知一下自己
+           socket.send({
+               user: SYSTEM,
+               color,
+               content: `你已离开${room}战队`,
+               createAt: new Date().toLocaleString()
+           });
+       }
+   });
});
```
#### 处理房间内发言
```
// app.js文件
...省略
// 上来记录一个socket.id用来查找对应的用户
+ let mySocket = {};

io.on('connection', socket => {
    ...省略
    // 这是所有连接到服务端的socket.id
+   mySocket[socket.id] = socket;
    
    socket.on('message', msg => {
        if (private) {
            ...省略
        } else {
            // 如果rooms数组有值，就代表有用户进入了房间
+           if (rooms.length) {
                // 用来存储进入房间内的对应的socket.id
+               let socketJson = {};

+               rooms.forEach(room => {
                    // 取得进入房间内所对应的所有sockets的hash值，它便是拿到的socket.id
+                   let roomSockets = io.sockets.adapter.rooms[room].sockets;
+                   Object.keys(roomSockets).forEach(socketId => {
                        console.log('socketId', socketId);
                        // 进行一个去重，在socketJson中只有对应唯一的socketId
+                       if (!socketJson[socketId]) {
+                           socketJson[socketId] = 1;
+                       }
+                   });
+               });

                // 遍历socketJson，在mySocket里找到对应的id，然后发送消息
+               Object.keys(socketJson).forEach(socketId => {
+                   mySocket[socketId].emit('message', {
+                       user: username,
+                       color,
+                       content: msg,
+                       createAt: new Date().toLocaleString()
+                   });
+               });
            } else {
                // 如果不是私聊的
                // 向所有人广播
                io.emit('message', {
                    user: username,
                    color,
                    content: msg,
                    createAt: new Date().toLocaleString()
                });
            }
        }
    });
});
```
重新运行app.js文件后，再进入房间聊天，只有在同一个房间内的用户，才能相互之间看到消息
### 小Tips
- socket.send()发送消息是为了给自己看的
- io.emit()发送消息是给所有人看的
- socket.broadcast.emit()发送消息除了自己都能看到