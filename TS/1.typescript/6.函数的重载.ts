// 重载，同一个函数名里面的参数不同，或者是参数相同而参数类型不同

// TS 表现为在同一个函数里提供不同的参数类型
// ⭐️只是用来限制参数的个数和类型的

// 函数的声明  
function attr(val:string):void;
function attr(val:number):void;
function attr(val:boolean):void;

// 函数体
function attr(val:string|number|boolean):void {
    console.log(typeof val, val);
}
attr('data');
attr(22);
attr(true);