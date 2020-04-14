"use strict";
// 多态，父类实现一个方法，然后子类去修改此方法去做不同的事情
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Animal2 = /** @class */ (function () {
    function Animal2() {
    }
    Animal2.prototype.speak = function () {
        console.log('do it');
    };
    return Animal2;
}());
var Dog = /** @class */ (function (_super) {
    __extends(Dog, _super);
    function Dog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Dog.prototype.speak = function () {
        console.log('小狗 汪汪汪');
    };
    return Dog;
}(Animal2));
var Cat = /** @class */ (function (_super) {
    __extends(Cat, _super);
    function Cat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cat.prototype.speak = function () {
        console.log('小猫 喵喵喵');
    };
    return Cat;
}(Animal2));
var dog = new Dog();
dog.speak();
var cat = new Cat();
cat.speak();
// 抽象类 abstract
var Animal3 = /** @class */ (function () {
    function Animal3() {
    }
    return Animal3;
}());
var Cat3 = /** @class */ (function (_super) {
    __extends(Cat3, _super);
    function Cat3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cat3.prototype.speak = function () {
        console.log('小猫 喵喵喵');
    };
    return Cat3;
}(Animal3));
