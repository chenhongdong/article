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
#### 将画线数据打包成json
#### 接收画线数据来绘制到画板上
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

socket.on('message', msg => {
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


// 发送消息函数
...省略

++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 开始在画板上画画了
// 鼠标按下时的操作
$('#canvas').on('mousedown', function(e) {
    let cvsPos = $(this).offset(),
        mouseX = e.pageX - cvsPos.left || 0,
        mouseY = e.pageY - cvsPos.top || 0;

    // 更新一下startX和startY
    gameObj.startX = mouseX;
    gameObj.startY = mouseY;
    // 更新为绘图状态
    gameObj.isDrawing = true;
});
// 鼠标移动时的操作
$('#canvas').on('mousemove', function(e) {
    // 当绘图状态为true的时候才可以绘制
    if (gameObj.isDrawing) {
        let cvsPos = $(this).offset(),
            mouseX = e.pageX - cvsPos.left || 0,
            mouseY = e.pageY - cvsPos.top || 0;

        if (gameObj.startX !== mouseX && gameObj.startY !== mouseY) {
            // 开始绘制线段，drawLine为画线函数
            drawLine(ctx, gameObj.startX, gameObj.startY, mouseX, mouseY, 1, $('#color').val());

            // 既然画线了，那就把画的线段数据也打包成json传给服务端
            let data = {};
            data.startX = gameObj.startX;
            data.startY = gameObj.startY;
            data.endX = mouseX;
            data.endY = mouseY;
            data.type = LINE;
            // 别犹豫，直接通过socket发给服务端
            socket.send(JSON.stringify(data));

            // 这里还要更新一下startX和startY
            gameObj.startX = mouseX;
            gameObj.startY = mouseY;
        }
    }
});

// 鼠标抬起时的操作
$('#canvas').on('mouseup', function() {
    gameObj.isDrawing = false;
});

// 画线函数
function drawLine(ctx, x1, y1, x2, y2, thick, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thick;
    ctx.strokeStyle = color;
    ctx.stroke();
}

++++++++++++++++++++++++++++++++++++++++++++++++++++++
```
## 构建多人游戏

### 游戏逻辑
游戏逻辑在客户端方面的实现相对来说还是比较简单的，更多的操作还是要靠服务端那里了，

那么就先由简到难的实现一下吧
#### 客户端
```
// index.js文件

const LINE = 0;
const MESSAGE = 1;

// 添加个游戏常量
const GAME = 2;

let gameObj = {
    ...省略

    // 游戏状态
    WAITTING: 0,
    START: 1,
    OVER: 2,
    RESTART: 3,
    // 当前轮到谁来绘图
    isPlayer: false
};

...省略

socket.on('message', msg => {
    let data = JSON.parse(msg);

    if (data.type === MESSAGE) {
        ...省略
    } else if (data.type === LINE) {
        ...省略
    } else if (data.type === GAME) { // 如果进行游戏，传过来的type值必须是GAME
        // 通过data.state来判断游戏当前的进度

        // 游戏开始的逻辑
        if (data.state === gameObj.START) {
            // 游戏要是开始了就需要清空画布
            ctx.clearRect(0, 0, cvs.width, cvs.height);

            // 清空聊天记录和隐藏重新开始
            $('#restart').hide();
            $('#history').html('');

            // 区分一下是当前画图的玩家还是猜图的玩家
            if (data.isPlayer) {
                gameObj.isPlayer = true;
                $('#history').append(`<li>轮到你了，请你画出<span class="answer">${data.answer}</span></li>`);
            } else {
                $('#history').append(`<li>游戏即将开始，请准备，你们有一分钟的时间去猜答案哦</li>`);
            }
        }

        // 游戏结束的逻辑
        if (data.state === gameObj.OVER) {
            gameObj.isPlayer = false;
            $('#restart').show();
            $('#history').append(`<li>本轮游戏的获胜者是<span class="winner">${data.winner}</span>，正确答案是： ${data.answer}</li>`);
        }

        if (data.state === gameObj.RESTART) {
            $('#restart').hide();
            ctx.clearRect(0, 0, cvs.width, cvs.height);
        }
    }
});

...省略

// 画线函数
...省略


// 重玩
$('#restart').on('click', function() {
    let data = {};
    data.type = GAME;
    data.state = gameObj.RESTART;
    socket.send(JSON.stringify(data));
});
```
### 游戏状态
### 获胜者及答案
#### 开始游戏
- 分配一个人来画画
- 随机分配个图案
- 通知所有玩家游戏开始
- 遍历客户端，然后找到画画的那个用户告诉他相关data
- 1分钟后游戏结束
- 恢复当前状态为START
#### 判断结果