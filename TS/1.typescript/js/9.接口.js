"use strict";
/*
    接口  本质上是一种约束
    约束对象
*/
function getUserInfo(user) {
    console.log(user.name + ", " + user.age + ", " + user.home);
}
function getVipInfo(user) {
    console.log(user.name + ", " + user.age);
}
getUserInfo({ name: 'chd', age: 11 });
getVipInfo({ name: 'lv', age: 10, home: 'bj' });
var cost = function (price) {
    return price * 0.8;
};
console.log(cost(100));
var arr = ['chd', 'lv', 'xiaobai'];
console.log(arr);
var Dog2 = /** @class */ (function () {
    function Dog2(name) {
        this.name = name;
        this.name = name;
    }
    Dog2.prototype.speak = function (something) {
        console.log('小狗 汪汪汪');
    };
    Dog2.prototype.fly = function () {
        console.log('会飞的小狗');
    };
    Dog2.prototype.blueFly = function () {
        console.log('蜂鸟');
    };
    return Dog2;
}());
var dog2 = new Dog2('柯基');
console.log(dog2);
