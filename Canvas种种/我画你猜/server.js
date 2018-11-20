const LINE_SEGMENT = 0;
const CHAT_MESSAGE = 1;

const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 9999});

ws.on('connection', (socket, req) => {
    // 初始化连接
    let message = '欢迎欢迎';

    let data = {};
    data.dataType = CHAT_MESSAGE;
    data.sender = '系统';
    data.message = message;

    socket.emit('message', JSON.stringify(data));

    // 监听message事件
    socket.on('message', msg => {
        console.log('接收： ' + msg);
        let data = JSON.parse(msg);

        if (data.dataType === CHAT_MESSAGE) {
            data.sender = socket;
        }
        socket.emit('message', JSON.stringify(data));

    });
    /* ws.clients.forEach(client => {
        console.log(client._receiver.Receiver);
    }) */
});
