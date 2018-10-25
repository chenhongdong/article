let socket = io();
// 列表list，输入框content，按钮sendBtn
let list = document.getElementById('list'),
    input = document.getElementById('input'),
    sendBtn = document.getElementById('sendBtn');

// 发言的方法
function send() {
    console.log(socket.connected);
    let value = input.value;
    if (value) {
        // 发送消息给服务器
        socket.emit('message', value);
        input.value = '';
    } else {
        alert('输入的内容不能为空！');
    }
}
// 回车发言的方法
function keySend(event) {
    const key = event.keyCode;
    if (key === 13) {
        send();
    }
}


// 点击按钮进行发言
sendBtn.onclick = send;
// 按回车进行发言
input.onkeydown = function (event) {
    keySend(event);
};


// 监听与服务端的连接
socket.on('connect', () => {
    console.log('连接成功');
    console.log(socket.connected);
    socket.emit('getHistory');
});

// 接收服务端传过来的消息
socket.on('message', data => {
    let li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `<p style="color: #ccc;"><span class="user">${data.user} </span>${data.createAt}</p>
                    <p class="content">${data.content}</p>`;
    list.appendChild(li);
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;
});