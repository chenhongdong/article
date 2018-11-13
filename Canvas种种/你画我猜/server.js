const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 9999 });

ws.on('connection', socket => {
    console.log(socket);
});