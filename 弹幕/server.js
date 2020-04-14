const WebSocket = require('ws');
// redis的客户端
const redis = require('redis');
const client = redis.createClient();    // key value

const ws = new WebSocket.Server({ port: 9999 });

// 原生的websocket就两个常用的方法 1.on('message')  2.send()
let clients = [];
ws.on('connection', socket => {
    clients.push(socket);

    client.lrange('barrageMsg', 0, -1, (err, applies) => {
        console.log(applies);
        applies = applies.map(item => JSON.parse(item));
        // 初始化数据
        console.log('后台初始化');
        socket.send(JSON.stringify({ type: 'init', data: applies }));
    });
    socket.on('message', msg => {
        // "{value, time, color, speed}"
        client.rpush('barrageMsg', msg, redis.print);

        clients.forEach(sk => {
            sk.send(JSON.stringify({ type: 'add', data: JSON.parse(msg) }));
        });

        // socket.send(JSON.stringify({ type: 'add', data: JSON.parse(msg) }));
    });

    socket.on('close', () => {
        clients = clients.filter(client => client !== socket);
    });
});