const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 9999});

let arr = ['周杰伦', '王俊凯', '易烊千玺', '蔡徐坤', '林俊杰', '王力宏', '鹿晗', '张艺兴', '吴亦凡', '吴克群'];

let client = arr[Math.floor(Math.random() * arr.length)];

const LINE_SEGMENT = 0; // 线段是0
const CHAT_MESSAGE = 1; // 聊天是1

ws.on('connection', socket => {
    let data = {};
    data.dataType = CHAT_MESSAGE;
    data.sender = '系统';
    data.message = '欢迎加入《我画你猜》';

    socket.send(JSON.stringify(data));
    // 监听message事件
    socket.on('message', msg => {
        let data = JSON.parse(msg);
        if (data.dataType === CHAT_MESSAGE) {
            data.sender = client;
        }
        socket.send(JSON.stringify(data));
    });
    
});
