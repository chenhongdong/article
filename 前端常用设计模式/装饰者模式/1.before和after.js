// 装饰器模式，借这里写写
let a = function() {
    alert(1);
};
// 保存原引用
let _a = a;
// 重写a的时候，不破坏a中的逻辑，然后添加新的逻辑
a = function() {
    _a();
    alert(2);
}

// a();

// 给函数动态增加功能
Function.prototype.before = function(beforeFn) {
    let self = this;
    return function() {
        beforeFn.apply(this, arguments);

        return self.apply(this, arguments);
    }
};
Function.prototype.after = function(afterFn) {
    let self = this;
    return function() {
        let res = self.apply(this, arguments);
        afterFn.apply(this, arguments);
        return res;
    }
};

// 不污染原型的话，就自己写好before和after，将原函数  和  新函数  传入
let before = function(fn, beforeFn) {
    return function() {
        console.log(this);
        // 新函数在原函数前执行
        beforeFn.apply(this, arguments);
        return fn.apply(this, arguments);
    }
};

let fn = before(
    function() {console.log(3)},
    function() {console.log(2)}
);

fn = before(fn, function() {console.log(1)});
fn();