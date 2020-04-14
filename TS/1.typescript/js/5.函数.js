"use strict";
function greet(name) {
    console.log('hello', name);
}
greet('chd');
// ts 形参和实参要完全一样
// ? 表示可选参数，而且只能放在最后一个参数上
function greeting2(name, age) {
    console.log('hello', name, age);
}
greeting2('chd');
greeting2('chd', 11);
function ajax(url, method) {
    if (method === void 0) { method = 'GET'; }
    console.log(method, url);
}
ajax('/user');
// 剩余参数
function sum() {
    var numbers = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        numbers[_i] = arguments[_i];
    }
    return numbers.reduce(function (val, item) {
        return val + item;
    }, 0);
}
var res = sum(1, 2, 3, 4, 5);
console.log(res);
