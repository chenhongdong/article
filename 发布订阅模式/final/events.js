let corp = {
    self: this
};
// 这次换成一个对象类型的缓存列表
corp.list = {};

corp.on = function(key, fn) {
    // 如果对象中没有对应的key值
    // 也就是说明没有订阅过
    // 那就给key创建个缓存列表
    if (!this.list[key]) {
        this.list[key] = [];
    }
    // 把函数添加到对应key的缓存列表里
    this.list[key].push(fn);
};
corp.emit = function() {
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
corp.on('other', function(skill, hobby) {
    console.log(this);
    console.log('你的技能有： ' + skill);
    console.log('爱好： ' + hobby);
});

corp.emit('join', '前端', 10000);
corp.emit('join', '后端', 10000);
corp.emit('other', '端茶和倒水', '足球');

