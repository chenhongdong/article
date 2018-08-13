let pub = {};

pub.list = [];

pub.listen = function(fn) {
    this.list.push(fn);
};

pub.trigger = function() {
    for (let i = 0, fn; fn = this.list[i++]; ) {
        fn.apply(this, arguments);
    }
};

// 栗子
pub.listen(function(foods, dinner) { // 小A
    console.log(`吃的是：${foods}`);
    console.log(`晚餐吃的是：${dinner}`);
});


pub.listen(function(price, meter) { // 小B
    console.log(`价格=${price}`);
    console.log(`平米=${meter}`);
});

pub.trigger('汉堡包', '田老师');
pub.trigger(399999, 110);

// 现在的问题是，把所有订阅的消息都推送了，即时不是订阅过的