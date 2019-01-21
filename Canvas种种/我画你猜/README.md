## 利用socket.io来实现消息的即时通信
### 启动服务并建立连接
首先通过express来启动一个服务再来创建socket.io的服务端连接
#### 服务端
```
// app.js文件
const express = require('express');
const app = express();
// 设置静态文件夹
app.use(express.static(__dirname));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
    console.log('服务端连接成功');
});


server.listen(9000);
```
#### 客户端
```
// game.js文件

let gameObj = {};
// 将socket实例赋值到myGame对象上
gameObj.socket = io();

gameObj.socket.on('connect', () => {
    console.log('客户端连接成功');
});
```

### 发送|接受|展示消息
#### 服务端
无论是发送还是接收消息，服务端首先要给访问页面的用户分配个名字，我们可以通过随机分配userList来做到
```
// app.js

...省略

+++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 区分是聊天还是在绘图
const LINE = 0;
const MESSAGE = 1;
const userList = ['皮卡丘', '巴大蝴', '比比鸟',  '妙蛙种子', '小火龙', '杰尼龟'];
+++++++++++++++++++++++++++++++++++++++++++++++++++++++

io.on('connection', socket => {
    +++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // 随机分配用户名并发送给所有人
    const user = userList[Math.floor(Math.random() * userList.length)];
    const message = `欢迎${user}加入游戏！！！`;

    // 将数据封装成json对象
    let data = {};
    // 通过type来区分
    data.type = MESSAGE;
    data.sender = '系统';
    data.message = message;
    // 将消息分发出去
    // 消息数据必须是字符串类型，so需要转换一下
    io.emit('message', JSON.stringify(data));

    socket.on('message', msg => {
        // 传过来的消息也是json字符串格式的，需要JSON.parse转成json
        let data = JSON.parse(msg);
        // 如果是聊天类型，就给sender赋值为当前用户名
        if (data.type === MESSAGE) {
            data.sender = user;
        }
        io.emit('message', JSON.stringify(data));
    });
    +++++++++++++++++++++++++++++++++++++++++++++++++++++++
});

server.listen(8888);
```

## Canvas来绘制画板

```
<canvas id="canvas" width="500" height="400"></canvas>
```
 ### 绘制画板逻辑

 ### 通过socket发送绘图数据
 #### 将画线数据打包成json
 #### 接收画线数据来绘制到画板上

 ## 构建多人游戏