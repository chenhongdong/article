let closeBtn = document.getElementById('close');

closeBtn.onclick = function() {
    Event.emit('switch', false);
};