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

### 发送|接收|展示消息
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
上面代码里把消息数据都打包成json的格式是为了方便处理，毕竟消息数据只能接收字符串的格式

然后在发送的时候再通过`JSON.stringify`给转成json字符串，这样就不会导致报错了

当然解析对应的消息数据时再通过`JSON.parse`来转换成真正的json即可了

服务端发送和接收消息都搞完了，那么接下来该客户端出场了，客户端除了上述两个功能之外还会展示消息，听起来屌屌的

那么，不啰嗦了，赶紧开始吧
#### 客户端
```
// index.js文件

+++++++++++++++++++++++++++
const LINE = 0;
const MESSAGE = 1;
+++++++++++++++++++++++++++

let gameObj = {};
...省略

+++++++++++++++++++++++++++
// 监听服务端发来的消息
gameObj.socket.on('message', msg => {
    // 需要先用JSON.parse转一下
    let data = JSON.parse(msg);
    console.log(data);  // {type: 1, sender: "系统", message: "欢迎皮卡丘进入游戏"}
    
    // 如果类型为聊天
    if (data.type === MESSAGE) {
        let li = `<li><span>${data.sender}： </span>${data.message}</li>`;
        $('#history').append(li);
        $('#history-wrapper').scrollTop($('#history-wrapper')[0].scrollHeight);
    }
});

// 点击发送按钮发消息
$('#btn').click(sendMsg);
// 按回车键发送消息
$('#input').keyup(e => {
    let keyCode = e.keyCode;
    if (keyCode === 13) {
        sendMsg();
    }
});

// 发送消息函数
function sendMsg() {
    let value = $.trim($('#input').val());
    if (value !== '') {
        let data = {};
        data.type = MESSAGE;
        data.message = value;
        gameObj.socket.send(JSON.stringify(data));
        $('#input').val('');
    }
}

+++++++++++++++++++++++++++
```
## Canvas来绘制画板
canvas这个元素已经等候多时了，终于轮到它大展身手了，用过canvas的都知道，我们常见的都是在2d上进行对应操作，所以在此之前先来获取一下
```
// index.js文件

++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 用原生来获取，jq对象中并没有我们需要的2d
let cvs = document.getElementById('canvas');
let ctx = cvs.getContext('2d');

let gameObj = {
    // 当前用户是否在绘图
    isDrawing: false,
    // 下一条线的起始点
    startX: 0,
    startY: 0
};

...省略

gameObj.socket.on('message', msg => {
    let data = JSON.parse(msg);

    if (data.type === MESSAGE) {
        let li = `<li><span>${data.sender}： </span>${data.message}</li>`;
        $('#history').append(li);
        $('#history-wrapper').scrollTop($('#history-wrapper')[0].scrollHeight);
    }
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++
    else if (data.type === LINE) {
        drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
    }
    ++++++++++++++++++++++++++++++++++++++++++++++++++++++
});

```
 ### 绘制画板逻辑

 ### 通过socket发送绘图数据
 #### 将画线数据打包成json
 #### 接收画线数据来绘制到画板上

 ## 构建多人游戏