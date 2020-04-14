let showNum = function () {
    let box = document.getElementById('box');
    
    Event.listen('add', num => {
        console.log(num);
        box.innerHTML = `现在的数是： ${num}`;
    });
};

showNum();