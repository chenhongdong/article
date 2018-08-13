
Event.listen('吃饭', function (eat) {
    console.log('今天吃:' + eat);
});

Event.trigger('吃饭', '🍚');