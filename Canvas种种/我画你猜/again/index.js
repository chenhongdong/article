let gameObj = {};

gameObj.socket = io();

gameObj.socket.on('connect', () => {
    console.log('连接成功'); 
});

gameObj.socket.on('message', msg => {
    console.log(msg);
    $('#chat-history').append(`<li>${msg}</li>`)
});
