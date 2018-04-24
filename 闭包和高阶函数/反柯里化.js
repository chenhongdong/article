Function.prototype.uncurrying = function() {
    let self = this;
    return function() {
        let obj = Array.prototype.shift.call(arguments);
        console.log(obj);
        return self.apply(obj, arguments);
    }
};

let slice = Array.prototype.slice.uncurrying();
let push = Array.prototype.push.uncurrying();

let obj = {
    'length': 1,
    '0': 1
};

// push(obj, 2);
// push(obj, 4);
// push(obj, 8);
push(obj, 110);
console.log(obj);

Function.prototype.uncurrying = function() {
    let self = this;
    return function() {
        return Function.prototype.call.apply(self, arguments);
    }
};

let slice = Array.prototype.slice.uncurrying();
let push = Array.prototype.push.uncurrying();

let obj = {
    'length': 1,
    '0': 1
};

push(obj, 2);
console.log(obj);

(function() {
    let result = slice(arguments);
    console.log(result);
})(1,2,3);

function after(time, cb) {
    return function() {
        if (--time === 0) {
            cb();
        }
    }
}
// 举个栗子吧，吃饭的时候，我很能吃，吃了三碗才能吃饱
let eat = after(3, function() {
    console.log('吃饱了');
});
eat();
eat();
// eat();
