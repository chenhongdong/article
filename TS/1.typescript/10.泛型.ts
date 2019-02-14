// 参数的泛型，用的不多
function calc<T>(val:T):T {
    return val;
}
console.log(calc<number>(1));
console.log(calc<string>('wow'));


// 类的泛型
class MyArr<T> {
    private list:T[] = [];  // 定义一个私有的属性list
    add(val:T) {
        this.list.push(val);
    }
    max():T {
        let ret = this.list[0];
        for (let i = 1; i < this.list.length; i++) {
            if (this.list[i] > ret) {
                ret = this.list[i];
            }
        }
        return ret;
    }
}
let myArr = new MyArr<number>();
myArr.add(3);
myArr.add(1);
myArr.add(10);
console.log(myArr.max());