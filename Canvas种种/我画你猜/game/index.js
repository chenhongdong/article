let gameObj = {
    // 当前是否在绘图
    isDrawing: false,
    // 绘制下一条线的起点
    startX: 0,
    startY: 0,

    // 区分
    LINE: 0,
    MESSAGE: 1,
}
gameObj.socket = io();

gameObj.socket.on('connect', () => {
    console.log('客户端连接成功');
});
// 监听message事件并展现消息
gameObj.socket.on('message', msg => {
    let data = JSON.parse(msg);
    console.log(data);
    if (data.type === gameObj.MESSAGE) {
        let html = `<li><span class="user">${data.sender}： </span>${data.message}</li>`;
        $('#history').append(html);
    }
});


function sendMsg() {
    let value = $('#input').val();
    if (value !== '') {
        let data = {};
        data.type = gameObj.MESSAGE;
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