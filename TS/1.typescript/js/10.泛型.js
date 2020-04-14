"use strict";
// 参数的泛型，用的不多
function calc(val) {
    return val;
}
console.log(calc(1));
console.log(calc('wow'));
// 类的泛型
var MyArr = /** @class */ (function () {
    function MyArr() {
        this.list = []; // 定义一个私有的属性list
    }
    MyArr.prototype.add = function (val) {
        this.list.push(val);
    };
    MyArr.prototype.max = function () {
        var ret = this.list[0];
        for (var i = 1; i < this.list.length; i++) {
            if (this.list[i] > ret) {
                ret = this.list[i];
            }
        }
        return ret;
    };
    return MyArr;
}());
var myArr = new MyArr();
myArr.add(3);
myArr.add(1);
myArr.add(10);
console.log(myArr.max());
