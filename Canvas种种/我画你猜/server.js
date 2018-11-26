const WebSocket = require('ws');
const ws = new WebSocket.Server({ port: 9999});

ws.on('connection', (socket, req) => {
    socket.send('哈哈');
    socket.on('message', data => {
        console.log('接收： ' + data);

        socket.emit('message', data);
    });
    /* ws.clients.forEach(client => {
        console.log(client._receiver.Receiver);
    }) */
});
