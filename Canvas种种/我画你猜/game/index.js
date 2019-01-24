// 区分
const LINE = 0;
const MESSAGE = 1;
const GAME = 2;

let cvs = document.getElementById('canvas');
let ctx = cvs.getContext('2d');
let gameObj = {
    // 当前是否在绘图
    isDrawing: false,
    // 绘制下一条线的起点
    startX: 0,
    startY: 0,
    // 游戏状态
    WAITTING: 0,
    START: 1,
    OVER: 2,
    RESTART: 3,
    // 表示谁来绘图
    isPlayer: false
}
let socket = io();

socket.on('connect', () => {
    console.log('客户端连接成功');
});
// 监听message事件并展现消息
socket.on('message', msg => {
    let data = JSON.parse(msg);
    console.log(data);
    if (data.type === MESSAGE) {
        let li = `<li><span class="user">${data.sender}： </span>${data.message}</li>`;
        $('#history').append(li);
        $('#history-wrapper').scrollTop($('#history-wrapper')[0].scrollHeight);
    } else if (data.type === LINE) {
        drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
    } else if (data.type === GAME) {
        // 游戏结束
        if (data.state === gameObj.OVER) {
            gameObj.isPlayer = false;
            $('#restart').show();
            $('#history').append(`<li>本轮游戏的获胜者是：<span class="winner">${data.winner}</span>，正确答案是：${data.answer}</li>`);
        }

        // 游戏开始
        if (data.state === gameObj.START) {
            // 先清空整个画布
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            
            $('#restart').hide();
            $('#history').html('');

            if (data.isPlayer) {
                gameObj.isPlayer = true;
                $('#history').append(`轮到你了，请画出${data.answer}`);
            } else {
                $('#history').append('游戏即将开始，你有一分钟的时间用来作答，请准备！');
            }
        }

        if (data.state === gameObj.RESTART) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);
        }
    }
});


function sendMsg() {
    let value = $.trim($('#input').val());
    if (value !== '') {
        let data = {};
        data.type = MESSAGE;
        data.message = value;
        socket.send(JSON.stringify(data));
        $('#input').val('');
    }
}

$('#btn').click(sendMsg);
$('#input').keyup(e => {
    let keyCode = e.keyCode;
    if (keyCode === 13)
        sendMsg();
});


// 开始在画板上画画
$('#canvas').on('mousedown', function(e) {
    let cvsPos = $(this).offset();
    let mouseX = e.pageX - cvsPos.left || 0;
    let mouseY = e.pageY - cvsPos.top || 0;

    gameObj.startX = mouseX;
    gameObj.startY = mouseY;
    gameObj.isDrawing = true;
});

$('#canvas').on('mousemove', function(e) {
    if (gameObj.isDrawing) {
        let cvsPos = $(this).offset();
        let mouseX = e.pageX - cvsPos.left || 0;
        let mouseY = e.pageY - cvsPos.top || 0;

        if (!(gameObj.startX === mouseX && gameObj.startY === mouseY)) {
            drawLine(ctx, gameObj.startX, gameObj.startY, mouseX, mouseY, 1);

            // 绘图的数据也打包成json一并传到服务端
            let data = {};
            data.startX = gameObj.startX;
            data.startY = gameObj.startY;
            data.endX = mouseX;
            data.endY = mouseY;
            data.type = LINE;
            // 将绘图数据发送给服务端
            socket.send(JSON.stringify(data));

            gameObj.startX = mouseX;
            gameObj.startY = mouseY;
        }
    }
});

$('#canvas').on('mouseup', function() {
    gameObj.isDrawing = false;
});

// 画线函数
function drawLine(ctx, x1, y1, x2, y2, thick) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thick;
    ctx.strokeStyle = '#00a1f4';
    ctx.stroke();
}

// 重玩
$('#restart').on('click', function() {
    let data = {};
    data.state = gameObj.RESTART;
    data.type = GAME;
    socket.send(JSON.stringify(data));

    $(this).hide();
});