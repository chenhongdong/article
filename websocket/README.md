## 三言两语说说HTTP
### HTTP是半双工通信
- 它是有特点的
    - HTTP是半双工通信的，同一时刻数据是单向流动的，客户端向服务端请求数据->单向，服务端向客户端返回数据->单向
    - 服务器不能主动的推送数据给客户端
## 双工通信
### websocket
在H5的websocket出现之前，为了实现这种推送技术，大家最常用的实现方式有这三种：轮询、长轮询和iframe流，但是他们三兄弟或多或少都有些美中不足
于是乎，在大神们的不断努力下，定义了websocket这个API
一语概括就是websocket实现了，在客户端和服务端上建立了一个长久的连接，两边可以任意发数据嗨皮
当然如果知道的更深一层的话，要知道它属于应用层的协议，它基于TCP传输协议，并复用HTTP的握手通道
说的再多，不如懂它，下面来看看websocket的优势何在
### websocket的优势
1. 支持双向通信，实时性更强(你可以来做个QQ，微信了，老铁)
2. 更好的二进制支持
3. 较少的控制开销(连接创建后，ws客户端、服务端进行数据交换时，协议控制的数据包头部较少)

那么废话说到这里了，接下来开始实战，检验一下成果



## socket.io
### socket.io的特点
- 易用性：封装了服务端和客户端，使用简单方便
- 跨平台：支持跨平台，可以选择在服务端或是客户端开发实时应用
- 自适应：会根据浏览器来自己决定是使用WebSocket、Ajax长轮询还是Iframe流等方式去选择最优方式，甚至支持IE5.5

### socket.io安装
```
    // 安装在本地项目
    npm i socket.io -S
```

### 启动服务，手写服务端
```
// server.js文件
const express = require('express');
const app = express();
// 设置静态文件夹
app.use(express.static(__dirname));
// 创建一个server服务
const server = require('http').createServer(app);
// websocket是依赖http协议进行握手
const io = require('socket.io')(server);

io.on('connection', function(socket) {
    socket.on('message', function(msg) {
        console.log(msg);   // 客户端发来的消息
        // send方法来给客户端发消息
        socket.send('你好我是服务端');      
    });
});

server.listen(3000);
```

============================================================================

### 划分命名空间
可以把websocket的服务划分成多个命名空间，默认是/，不同空间内是不能通信的，
io.of()方法是来划分空间的
```
// 因为是默认的，所以可以不用写成io.of('/').on('connection')的形式
io.on('connection', socket => {});
// 访问/music空间
io.on('/music').on('connection', socket => {});
```


### socket.io注意事项
1. 可以把服务分成多个命名空间，默认/，不同空间内不能通信
2. 可以把一个命名空间分成多个房间，一个客户端可以同时进入多个房间
3. 如果在大厅里广播，那么所有人都能看到消息

### 区分不同消息的发送
socket.send  向某个人说话
io.emit('message')  向所有的客户端说话
刚进到聊天室，socket.broadcast.emit向除自己之外的人广播

### 梳理一下功能
1. 首先进入聊天室中，建立连接
2. 通过变量username去存储一个用户名
    - 如果是第一次登陆，那就除自己外向所有人广播一下
    - 如果登录过了，就可以实现私聊和公聊了