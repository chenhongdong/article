let openBtn = document.getElementById('open');

openBtn.onclick = function () {
    Event.emit('switch', true);
};