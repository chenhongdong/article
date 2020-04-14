let handleClick = function () {
    let num = 0;
    let btn = document.getElementById('btn');

    btn.addEventListener('click', function () {
        Event.trigger('add', num++);
    });
};

handleClick();