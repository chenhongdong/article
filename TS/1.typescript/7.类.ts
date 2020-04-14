class Person {
    name:string
    age:number
    constructor(name:string, age:number) {
        this.name = name;
        this.age = age;
    }
    getName():string {
        return this.name;
    }
}

let p1 = new Person('chd', 10);
console.log(p1);

// 继承
class Other extends Person {
    no:number
    constructor(name:string, age:number, no:number) {
        super(name, age);
        this.no = no;
    }
    getNo():number {
        return this.no;
    }
}

let o1 = new Other('chd', 11, 7);
console.log(o1);


// 修饰符
/* 
    public      公开的，自己，子类，其他类都能访问
    protected   受保护的，自己，子类能访问，but其他人不能访问
    private     私有的，只有自己访问，子类，其他人都不能访问
*/
class Father {
    public name:string
    protected age:number
    private money:number
    constructor(name:string, age:number, money:number) {
        this.name = name;
        this.age = age;
        this.money = money;
    }
    getName():string {
        return this.name;
    }
    getMoney():number {
        return this.money;
    }
}

class Child extends Father {
    getAge() {
        return this.age;
    }
}

let child = new Child('chd', 11, 2019);
console.log(child.name);
// console.log(child.age);      不能访问
// console.log(child.money);    不能访问


class Animal {
    constructor(public name:string) {
        this.name = name;
    }
}