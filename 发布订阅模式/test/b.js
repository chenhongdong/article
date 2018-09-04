let box = document.getElementById('box');


Event.on('add', data => {
    console.log(data);
    box.innerHTML = data;
});

Event.on('render', function() {
    console.log(arguments);
})