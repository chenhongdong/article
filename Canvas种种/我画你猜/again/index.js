let gameObj = {
    // 当前是否在进行绘图
    isDrawing: false,
    // 绘制下一条线的起点
    startX: 0,
    startY: 0,
    // ### 通过socket发送绘图数据
    LINE: 0,
    MESSAGE: 1,
    // ### 通过socket发送绘图数据

    // ## 构建多人游戏
    GAME_LOGIC: 2,
    // 游戏逻辑状态
    WAITING: 0,
    GAME_START: 1,
    GAME_OVER: 2,
    GAME_RESTART: 3,
    // 谁来进行绘图
    isTurnToDraw: false
    // ## 构建多人游戏
};
// 获取canvas上下文,这里不能用jq去获取,会找不到对应的canvas上下文
const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

// ### 绘制画板
// 在canvas上进行绘图
// if (gameObj.isTurnToDraw) {
    $('#canvas').on('mousedown', function(e) {
        let pos = $(this).offset();

        let mouseX = (e.pageX - pos.left) || 0;
        let mouseY = (e.pageY - pos.top) || 0;

        gameObj.startX = mouseX;
        gameObj.startY = mouseY;
        gameObj.isDrawing = true;
    }).on('mousemove', function(e) {
        // 当已经开始绘图时，才开始画线
        if (gameObj.isDrawing) {
            let pos = $(this).offset();

            let mouseX = (e.pageX - pos.left) || 0;
            let mouseY = (e.pageY - pos.top) || 0;

            if (!(mouseX === gameObj.startX && mouseY === gameObj.startY)) {
                drawLine(ctx, gameObj.startX, gameObj.startY, mouseX, mouseY, 1);

                // #### 将画线数据打包成json

                let data = {};
                data.type = gameObj.LINE;
                data.startX = gameObj.startX;
                data.startY = gameObj.startY;
                data.endX = mouseX;
                data.endY = mouseY;
                gameObj.socket.send(JSON.stringify(data));
                // #### 将画线数据打包成json

                gameObj.startX = mouseX;
                gameObj.startY = mouseY;
            }
        }
    }).on('mouseup', () => {
        gameObj.isDrawing = false;
    });
// }
// 在起点和终点之间绘制线段
function drawLine(ctx, x1, y1, x2, y2, thick) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thick;
    ctx.strokeStyle = '#00a1f4';
    ctx.stroke();
}

// ### 绘制画板


// ### 建立连接
// 创建io去连接服务端
gameObj.socket = io();

gameObj.socket.on('connect', () => {
    console.log('连接成功'); 
});

gameObj.socket.on('message', msg => {
    // #### 接收画线数据来绘制到画板上
    let data = JSON.parse(msg);
    if (data.type === gameObj.MESSAGE) {
        $('#chat-history').append(`<li><span class="user">${data.sender}</span>： ${data.message}</li>`)
        $('#history-wrapper').scrollTop($('#history-wrapper')[0].scrollHeight);
    } else if (data.type === gameObj.LINE) {
        drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
    } else if (data.type === gameObj.GAME_LOGIC) { // ## 构建多人游戏
        // 如果游戏状态为结束，就展示获胜的选手
        if (data.gameState === gameObj.GAME_OVER) {
            gameObj.isTurnToDraw = false;
            $('#chat-history').append(`<li><span class="winner">${data.winner}</span>获胜了，回答的是：<em>${data.answer}</em></li>`);
            $('#restart').show();
        }

        if (data.gameState === gameObj.GAME_START) {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // 隐藏重玩按钮
            $('#restart').hide();
            // 清空聊天记录
            $('chat-history').html('');
            
            // 如果轮到了画图的选手，会看到不一样的文字提示
            if (data.isPlayer) {
                gameObj.isTurnToDraw = true;
                $('#chat-history').append(`<li>请你用心的画出<span style="color: yellow">${data.answer}</span>吧</li>`);
            } else {
                $('#chat-history').append('<li>游戏即将开始，你有1分钟的时间去猜哦</li>');
            }
        }
    }
    // ## 构建多人游戏
    // #### 接收画线数据来绘制到画板上
    
});
// ### 建立连接

// #### 发送消息

// 点击发送消息
$('#btn').click(sendMsg);
// 回车发送消息
$('#chat-input').keypress(e => {
    if (e.keyCode === 13) {
        sendMsg();
    }
});

function sendMsg() {
    let val = $('#chat-input').val().trim();
    let data = {};
    data.type = gameObj.MESSAGE;
    data.message = val;
    if (val) {
        gameObj.socket.send(JSON.stringify(data));
        $('#chat-input').val('');
    }
    
}
// #### 发送消息

// #### 重玩
$('#restart').click(restart);

function restart() {
    let data = {};
    data.type = gameObj.GAME_LOGIC;
    data.gameState = gameObj.GAME_RESTART;

    gameObj.socket.send(JSON.stringify(data));
}