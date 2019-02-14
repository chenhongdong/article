
// 多态，父类实现一个方法，然后子类去修改此方法去做不同的事情

class Animal2 {
    speak() {
        console.log('do it');
    }
}
class Dog extends Animal2 {
    speak() {
        console.log('小狗 汪汪汪');
    }
}
class Cat extends Animal2 {
    speak() {
        console.log('小猫 喵喵喵');
    }
}
let dog = new Dog();
dog.speak();
let cat = new Cat();
cat.speak();



// 抽象类 abstract
abstract class Animal3 {
    abstract speak():void;
}

class Cat3 extends Animal3 {
    speak() {
        console.log('小猫 喵喵喵');
    }
}