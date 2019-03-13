/* 
    数据类型：
        boolean 布尔
        number  数字
        string  字符串

        string[]  字符串数组(数组里的类型只能是string)

        元组类型(tuple)
        枚举类型(enum)
*/

let isMarried:boolean = true;
isMarried = false;
let age:number = 20;
let firstname:string = 'chd';
let hobby:string[] = ['抽烟', '喝酒', '烫头'];
let numbers:Array<number> = [4, 5, 6];
let str:Array<string> = ['1', 'a', 'c'];
let students:Array<object> = [{name: 'chd'}, {name: 'lv'}];


let fullname:[string, string, number] = ['张', '三', 100];
let arr2:Array<string|number> = [1, 'www'];


// 定义了一个枚举类型的值
enum Gender {
    GIRL='女生',
    BOY='男生'
}
console.log(`李雷是${Gender.BOY}, 韩梅梅是${Gender.GIRL}`);
// 栗子： 去拼多多买货
enum OrderStatus {
    WaitForPay = '等待付款',
    WaitForSend = '等待发货',
    Sended = '已发货',
    Signed = '已签收'
}


let array:string[] = ['1', '2', 'bobo'];

for (let i in array) {
    console.log(i);
}

for (let j of array) {
    console.log(j);
}