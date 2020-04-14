let pub = {};
// 缓存列表，存放订阅的回调函数
pub.list = [];
// 添加订阅者
pub.listen = function(key, fn) {
    // 如果还没有订阅过该类消息，就给该类消息添加缓存列表
    if (!this.list[key]) {
        this.list[key] = [];
    }
    this.list[key].push(fn);
};
// 发布消息
pub.trigger = function() {
    let key = [].shift.call(arguments),
        fns = this.list[key];
    console.log(key);
    // 如果没有订阅消息则返回false
    if (!fns || fns.length === 0) { 
        return false;
    }

    for (let i = 0; i < fns.length; i++) {
        fns[i].apply(this, arguments);
    }
};


pub.listen('A', function(foods, dinner) { // 小A
    console.log(`吃的是：${foods}`);
    console.log(`晚餐吃的是：${dinner}`);
});


pub.listen('B', function(price, meter) { // 小B
    console.log(`价格=${price}`);
    console.log(`平米=${meter}`);
});

pub.trigger('A', '汉堡包', '田老师');
pub.trigger('B', 399999, 110);



let corp = {};
corp.list = {};

corp.on = function(key, fn) {
    if (!this.list[key]) {
        this.list[key] = [];
    }
    this.list[key].push(fn);
};
corp.trigger = function() {
    // 第一个参数是对应的key值
    // 直接用数组的shift方法取出
    let key = [].shift.call(arguments),
        fns = this.list[key];
    // 如果缓存列表里没有函数就返回false
    if (!fns || fns.length === 0) {
        return false;
    }
    // 遍历key值对应的缓存列表
    // 依次执行函数的方法
    fns.forEach(fn => {
        fn.apply(this, arguments);
    });
};

// 测试用例
corp.on('join', (position, salary) => {
    console.log('你的职位是：' + position);
    console.log('期望薪水：' + salary);
});
corp.on('other', (skill, hobby) => {
    console.log('你的技能有： ' + skill);
    console.log('爱好： ' + hobby);
});

corp.trigger('join', '前端', 10000);
corp.trigger('join', '后端', 10000);
corp.trigger('other', '端茶和倒水', '足球');