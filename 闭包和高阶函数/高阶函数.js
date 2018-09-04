// 柯里化(忍者提供)
Function.prototype.curry = function () {
    let fn = this,
        slice = Array.prototype.slice,
        args = slice.call(arguments);

        console.log(args);

    return function () {
        return fn.apply(null, args.concat(slice.call(arguments)));
    }
};
function add(a, b) {
    return a + b;
}
let add1 = add.curry(1);
console.log(add1(7));


function curry(fn) {
    let slice = Array.prototype.slice,  y7ttttttt2// 将slice缓存起来
        args = slice.call(arguments, 1);   // 这里将arguments转成数组并保存
        
    return function() {
        // 将新旧的参数拼接起来
        let newArgs = args.concat(slice.call(arguments));
        return fn.apply(null, newArgs); // 返回执行的fn并传递最新的参数
    }
}

function add(a, b) {
    return a + b;
}

let sum = curry(add);
console.log(sum);
console.log(sum(1)(2)());

let add1 = add.curry(1);
console.log(add1(7));

// 柯里化(精通js提供)
function addGen(num) {
    return function (toAdd) {
        return num + toAdd;
    }
}

let plus = addGen(5);
let result = plus(4);

console.log(result);

// 柯里化(设计模式实践提供)
let currying = function (fn) {
    let args = [];

    return function () {
        if (arguments.length === 0) {
            return fn.apply(this, args);
        } else {
            [].push.apply(args, arguments);
            return arguments.callee;
        }
    }
};
let count = 0;
let num = currying(function() {
    for (let i = 0; i < arguments.length; i++) {
        count += arguments[i];
    }
});
num(1);
num(2);
num(9);
num();
console.log(count);


let cost = (function () {
    let money = 0;
    
    return function () {
        for (let i = 0, len = arguments.length; i < len; i++) {
            money += arguments[i];
        }
        return money;
    }
})();

cost = currying(cost);
cost(100, 200)(200, 100, 100)(400);




const fn = (a, b, c, d) => {
    console.log(a, b, c, d);
};
function add(a, b) {
    return a + b;
}
var curry2 = function(func,args){
    var length = func.length;
    args = args||[];

    return function(){
        newArgs = args.concat([].slice.call(arguments));
        if(newArgs.length < length){
            return curry2.call(this,func,newArgs);
        }else{
            return func.apply(this,newArgs);
        }
    }
}
let cost = (function () {
    let money = 0;
    
    return function () {
        for (let i = 0, len = arguments.length; i < len; i++) {
            money += arguments[i];
        }
        return money;
    }
})();
cost = curry2(cost);
console.log(cost(100, 200)(200, 100, 100)(400));

console.log(foo(1, 4));


//单例
let getSingle = function(fn) {
    let ret;
    return function() {
        return ret || (ret = fn.apply(this, arguments));
    }
};

let getDiv = getSingle(function() {
    return document.createElement('div');
});

let div1 = getDiv();
let div2 = getDiv();
console.log(div1 === div2);
console.log(div1);
console.log(div2);



function curry(fn) {
    const g = (...allArgs) => allArgs.length >= fn.length ?
        fn(...allArgs) : 
        (...args) => g(...allArgs, ...args)

    return g;
}

// 测试用例
const foo = curry((a, b, c, d) => {
    console.log(a, b, c, d);
});
foo(1)(2)(3)(4);    // 1 2 3 4
const f = foo(1)(2)(3);
f(5);               // 1 2 3 5
