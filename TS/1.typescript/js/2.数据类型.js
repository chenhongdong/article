"use strict";
/*
    数据类型：
        boolean 布尔
        number  数字
        string  字符串

        string[]  字符串数组(数组里的类型只能是string)

        元组类型(tuple)
        枚举类型(enum)
*/
var isMarried = true;
isMarried = false;
var age = 20;
var firstname = 'chd';
var hobby = ['抽烟', '喝酒', '烫头'];
var numbers = [4, 5, 6];
var str = ['1', 'a', 'c'];
var students = [{ name: 'chd' }, { name: 'lv' }];
var fullname = ['张', '三', 100];
var arr2 = [1, 'www'];
// 定义了一个枚举类型的值
var Gender;
(function (Gender) {
    Gender["GIRL"] = "\u5973\u751F";
    Gender["BOY"] = "\u7537\u751F";
})(Gender || (Gender = {}));
console.log("\u674E\u96F7\u662F" + Gender.BOY + ", \u97E9\u6885\u6885\u662F" + Gender.GIRL);
// 栗子： 去拼多多买货
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["WaitForPay"] = "\u7B49\u5F85\u4ED8\u6B3E";
    OrderStatus["WaitForSend"] = "\u7B49\u5F85\u53D1\u8D27";
    OrderStatus["Sended"] = "\u5DF2\u53D1\u8D27";
    OrderStatus["Signed"] = "\u5DF2\u7B7E\u6536";
})(OrderStatus || (OrderStatus = {}));
var array = ['1', '2', 'bobo'];
for (var i in array) {
    console.log(i);
}
for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
    var j = array_1[_i];
    console.log(j);
}
