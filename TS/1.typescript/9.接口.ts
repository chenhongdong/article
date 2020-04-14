/* 
    接口  本质上是一种约束
    约束对象
*/

interface userInterface {
    name: string,
    age: number,
    home?: string
}

function getUserInfo(user: userInterface): void {
    console.log(`${user.name}, ${user.age}, ${user.home}`);
}
function getVipInfo(user: userInterface): void {
    console.log(`${user.name}, ${user.age}`);
}

getUserInfo({ name: 'chd', age: 11 });
getVipInfo({ name: 'lv', age: 10, home: 'bj' });





// 如果希望对一个函数的参数和返回值进行 约束
interface discount {
    (price:number):number
}

let cost:discount = function (price:number):number {
    return price * 0.8;
}
console.log(cost(100));


// 可索引接口
interface arrInterface {
    [index:number]:string
}
let arr:arrInterface = ['chd', 'lv', 'xiaobai'];
console.log(arr);





// 如何用接口来约束类
// 一个类可以实现多个接口
interface Ani {
    name:string,
    speak(something:string):void
}
interface Bird {
    fly():void
}
// 接口也可以继承接口
interface BlueBird {
    blueFly():void;
}
class Dog2 implements Ani,BlueBird {
    constructor(public name:string) {
        this.name = name;
    }
    speak(something:string):void {
        console.log('小狗 汪汪汪');
    }
    fly():void {
        console.log('会飞的小狗');
    }
    blueFly() {
        console.log('蜂鸟');
    }
}
let dog2 = new Dog2('柯基');
console.log(dog2);