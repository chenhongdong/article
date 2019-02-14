function greet(name:string):void {
    console.log('hello', name);
}
greet('chd');

// ts 形参和实参要完全一样
// ? 表示可选参数，而且只能放在最后一个参数上
function greeting2(name:string, age?:number) {
    console.log('hello', name, age);
}
greeting2('chd');
greeting2('chd', 11);



function ajax(url:string, method:string='GET') {
    console.log(method, url);
}
ajax('/user');

// 剩余参数
function sum(...numbers:number[]) {
    return numbers.reduce((val, item) => {
        return val + item;
    }, 0);
}
let res = sum(1,2,3,4,5);
console.log(res);