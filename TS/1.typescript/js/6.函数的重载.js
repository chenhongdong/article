"use strict";
// 重载，同一个函数名里面的参数不同，或者是参数相同而参数类型不同
// 函数体
function attr(val) {
    console.log(typeof val, val);
}
attr('data');
attr(22);
attr(true);
