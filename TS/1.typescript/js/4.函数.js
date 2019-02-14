"use strict";
// :void表示函数没有返回值
function greeting(name) {
    console.log('hello', name);
    // return 'ok';
}
greeting('god');
// never类型出现的很少，基本用于抛出异常
var nex;
nex = (function () {
    throw new Error('Wrong');
})();
/*
    any  任何的值
    void 是any的反义，不能有任何值
    never 永远不会有返回值，函数永远不会正常的结束
*/
var ak = 47;
function say() {
    // 不能有返回值
}
function multi() {
    throw Error('err');
    // 异常抛出，后面代码不执行，函数不会结束，也不会有返回值
}
function divide(a, b) {
    return a / b;
}
divide(10, 2);
divide(10, 0);
