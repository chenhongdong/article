$(function () {
    let websocketGame = {
        // 指示当前是否正在进行绘图
        isDrawing: false,
        // 绘制下一条线的起点
        startX: 0,
        startY: 0,
        LINE_SEGMENT: 0,
        CHAT_MESSAGE: 1,
        GAME_LOGIC: 2,
        // ++ 游戏逻辑状态常量
        WAITING_TO_START: 0,
        GAME_START: 1,
        GAME_OVER: 2,
        GAME_RESTART: 3,
        // ++ 表明由哪个玩家来画
        isTurnToDraw: false
    };
    websocketGame.socket = io();

    websocketGame.socket.on('connect', () => {
        console.log('客户端连接成功');
    });

    websocketGame.socket.on('message', msg => {
        let data = JSON.parse(msg);
        if (data.dataType === websocketGame.CHAT_MESSAGE) {
            $('#chat-history').append(`<li>${data.sender} 说： ${data.message}</li>`);
        } else if (data.dataType === websocketGame.LINE_SEGMENT) {
            drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
        } else if (data.dataType === websocketGame.GAME_LOGIC) {    // ++ 如果是游戏逻辑
            if (data.gameState === websocketGame.GAME_OVER) { // 游戏结束
                websocketGame.isTurnToDraw = false;
                $('#chat-history').append(`<li>获胜者是： <span class="winner">${data.winner}</span>！正确的答案是： ${data.answer}</li>`);
                $('#restart').show();
            }
            // 游戏开始
            if (data.gameState === websocketGame.GAME_START) {
                // 清除canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // 隐藏restart按钮
                $('#restart').hide();
                // 清除聊天记录
                $('#chat-history').html('');

                if (data.isTurnToDraw) {
                    websocketGame.isTurnToDraw = true;
                    $('#chat-history').append(`<li>轮到你了，请画出 ${data.answer}</li>`);
                } else {
                    $('#chat-history').append('<li>游戏即将开始，请准备。你有一分钟的时间去猜答案</li>')
                }
            }
        }

    });

    $('#btn').on('click', sendMsg);

    $('#chat-input').on('keypress', e => {
        if (e.keyCode === 13) {
            sendMsg();
        }
    });

    function sendMsg() {
        let msg = $('#chat-input').val();
        // 将消息打包成对象
        let data = {};
        data.dataType = websocketGame.CHAT_MESSAGE;
        data.message = msg;

        websocketGame.socket.send(JSON.stringify(data));
        $('#chat-input').val('');
    }
    // 用原生去获取canvas的上下文，jq获取被转成了jq对象，获取不到的
    let canvas = document.getElementById('drawing-pad');
    let ctx = canvas.getContext('2d');

    $('#drawing-pad').on('mousedown', function (e) {
        // 获取相对于canvas左上角位置鼠标的x和y坐标
        let canvasPos = $(this).offset();
        let mouseX = e.pageX - canvasPos.left || 0;
        let mouseY = e.pageY - canvasPos.top || 0;

        websocketGame.startX = mouseX;
        websocketGame.startY = mouseY;
        websocketGame.isDrawing = true;
    }).on('mousemove', function (e) {
        if (websocketGame.isDrawing) {
            let canvasPos = $(this).offset();
            let mouseX = e.pageX - canvasPos.left || 0;
            let mouseY = e.pageY - canvasPos.top || 0;

            // 如果鼠标移动坐标和起送坐标不相同，就可以绘制线段了
            if (!(mouseX === websocketGame.startX && mouseY === websocketGame.startY)) {
                drawLine(ctx, websocketGame.startX, websocketGame.startY, mouseX, mouseY, 1);

                // + 添加数据
                let data = {};
                data.dataType = websocketGame.LINE_SEGMENT;
                data.startX = websocketGame.startX;
                data.startY = websocketGame.startY;
                data.endX = mouseX;
                data.endY = mouseY;
                websocketGame.socket.send(JSON.stringify(data));

                websocketGame.startX = mouseX;
                websocketGame.startY = mouseY;
            }
        }
    }).on('mouseup', function () {
        websocketGame.isDrawing = false;
    });

    function drawLine(ctx, x1, y1, x2, y2, thickness) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = '#00a1f4';
        ctx.stroke();
    }
});