let wrap = document.getElementById('wrap');

Event.on('add', num => {
    wrap.innerHTML = num;
});