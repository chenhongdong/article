
// 先发布后订阅
Event.trigger('click', 1);

Event.listen('click', function(a) {
    console.log(a);
});

// 命名空间
Event.create('space1').listen('click', function(a) {
    console.log(a);
});

Event.create('space1').trigger('click', 100);

Event.create('space2').listen('click', function(a) {
    console.log(a);
});

Event.create('space2').trigger('click', 200);