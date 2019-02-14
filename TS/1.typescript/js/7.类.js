"use strict";
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
var Person = /** @class */ (function () {
    function Person(name, age) {
        this.name = name;
        this.age = age;
    }
    Person.prototype.getName = function () {
        return this.name;
    };
    return Person;
}());
var p1 = new Person('chd', 10);
console.log(p1);
// 继承
var Other = /** @class */ (function (_super) {
    __extends(Other, _super);
    function Other(name, age, no) {
        var _this = _super.call(this, name, age) || this;
        _this.no = no;
        return _this;
    }
    Other.prototype.getNo = function () {
        return this.no;
    };
    return Other;
}(Person));
var o1 = new Other('chd', 11, 7);
console.log(o1);
// 修饰符
/*
    public      公开的，自己，子类，其他类都能访问
    protected   受保护的，自己，子类能访问，but其他人不能访问
    private     私有的，只有自己访问，子类，其他人都不能访问
*/
var Father = /** @class */ (function () {
    function Father(name, age, money) {
        this.name = name;
        this.age = age;
        this.money = money;
    }
    Father.prototype.getName = function () {
        return this.name;
    };
    Father.prototype.getMoney = function () {
        return this.money;
    };
    return Father;
}());
var Child = /** @class */ (function (_super) {
    __extends(Child, _super);
    function Child() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Child.prototype.getAge = function () {
        return this.age;
    };
    return Child;
}(Father));
var child = new Child('chd', 11, 2019);
console.log(child.name);
// console.log(child.age);      不能访问
// console.log(child.money);    不能访问
var Animal = /** @class */ (function () {
    function Animal(name) {
        this.name = name;
        this.name = name;
    }
    return Animal;
}());
