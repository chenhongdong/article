// 区分
const LINE = 0;
const MESSAGE = 1;

let cvs = document.getElementById('canvas');
let ctx = cvs.getContext('2d');
let gameObj = {
    // 当前是否在绘图
    isDrawing: false,
    // 绘制下一条线的起点
    startX: 0,
    startY: 0,
}
gameObj.socket = io();

gameObj.socket.on('connect', () => {
    console.log('客户端连接成功');
});
// 监听message事件并展现消息
gameObj.socket.on('message', msg => {
    let data = JSON.parse(msg);
    console.log(data);
    if (data.type === MESSAGE) {
        let li = `<li><span class="user">${data.sender}： </span>${data.message}</li>`;
        $('#history').append(li);
        $('#history-wrapper').scrollTop($('#history-wrapper')[0].scrollHeight);
    } else if (data.type === LINE) {
        drawLine(ctx, data.startX, data.startY, data.endX, data.endY, 1);
    }
});


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
            gameObj.socket.send(JSON.stringify(data));

            gameObj.startX = mouseX;
            gameObj.startY = mouseY;
        }
    }
});

$('#canvas').on('mouseup', function() {
    $('#canvas').off();
    gameObj.isDrawing = false;
});

// 画线函数
function drawLine(ctx, x1, y1, x2, y2, thick) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thick;
    ctx.strokeStyle = '#0cc';
    ctx.stroke();
}