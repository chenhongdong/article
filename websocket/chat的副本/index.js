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
    li.innerHTML = `<p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
                    <p class="content" style="background:${data.color}">${data.content}</p>`;
    list.appendChild(li);
    // 将聊天区域的滚动条设置到最新内容的位置
    list.scrollTop = list.scrollHeight;
});

// 私聊的方法
function privateChat(event) {
    let target = event.target;
    // 拿到对应的用户名
    let user = target.innerHTML;
    // 只有class为user的才是目标元素
    if (target.className === 'user') {
        input.value = `@${user} `;
    }
}
// 点击进行私聊
list.onclick = function(event) {
    privateChat(event);
};
// 进入房间
function join(room) {
    console.log(room);
    socket.emit('join', room);
}
// 监听是否已进入房间
socket.on('joined', room => {
    document.getElementById(`join-${room}`).style.display = 'none';
    document.getElementById(`leave-${room}`).style.display = 'inline-block';
});

// 离开房间
function leave(room) {
    socket.emit('leave', room);
}
socket.on('leaved', room => {
    document.getElementById(`leave-${room}`).style.display = 'none';
    document.getElementById(`join-${room}`).style.display = 'inline-block';
});

socket.on('history', history => {
    let html = history.map(data => {
        return `<li class="list-group-item">
            <p style="color: #ccc;"><span class="user" style="color:${data.color}">${data.user} </span>${data.createAt}</p>
            <p class="content" style="background:${data.color}">${data.content}</p>
        </li>`;
    }).join('');

    list.innerHTML = html + '<li style="margin: 12px 0;text-align: center;">以上为历史消息</li>';
    list.scrollTop = list.scrollHeight;
});