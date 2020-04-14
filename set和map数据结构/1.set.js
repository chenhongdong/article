const Set = require('./Set.js');

var set = new Set([1,23,4,6]);
console.log(set.values());
for (let item of set.values()) {
    console.log(item);
}
console.log(set.size);
set.forEach((value, key) => console.log(key + ' : ' + value));
set = new Set([...set].map(x => x * 2));

// 数组去重
let arr = new Set([3, 5, 2, 1, 2, 5, 5]).values();
console.log(arr)

// 间接使用map和filter
const Set = require('./Set.js');
let arr = new Set([1, 2, 3]).values();
m = new Set(arr.map(x => x * 2));
f = new Set(arr.filter(x => x>1));
console.log(m.values());
console.log(f.values());

// 并集，交集，差集，子集
// 并集
const Set = require('./Set.js');
let a = [1, 2, 3];
let b = new Set([4, 3, 2]);
let union = new Set(a).union(b).values();
console.log(union);
// 交集
const Set = require('./Set.js');
let b = new Set([4, 3, 2]);
let intersect = new Set([1,2,3]).intersect(b).values();
console.log(intersect);
// 差集
const Set = require('./Set.js');
let b = new Set([4, 3, 2]);
let difference = new Set([1,2,3]).difference(b).values();
console.log(difference)
// 子集
const Set = require('./Set.js');
let b = new Set([4, 3, 2]);
let subset = new Set([4,1,3]).subset(b);
console.log(subset);


// 使用Set类
const Set = require('./Set.js');
var set = new Set();
set.add(1);
set.add(4);
set.add('3');
// set.forEach((value, key) => console.log(key + ' : ' + value));
let arr = set.values(); 
console.log(arr);
arr = new Set(arr.map(x => x * 2)).values();
console.log(arr);

console.log(set.keys());
console.log(set.has(1));
console.log(set.size);

set.delete(1);
console.log(set.values());
set.clear();
console.log(set.size);

set.add(2);
console.log(set.values());
console.log(set.has(2));
console.log(set.size());
set.delete(1);
console.log(set.values());
set.delete(2);
console.log(set.values());


let set = new Set();
let a = 2;
let b = 1;
set.add(a);
set.add(b);
console.log(set.has(a));
console.log(set)    // Set { NaN }  //添加了两个NaN,但是只能加入一个。内部判断NaN是相等的了

// 两个对象总是不等的
let set = new Set();
set.add({});
set.add({});
set.size;   // 2
console.log(set);   // Set { {}, {} }


// Set实例的属性和方法
// 属性：size
// 方法分为两大类：操作方法和遍历方法
/*
    操作方法：
    add
    delete
    has

*/ 

let set = new Set([1,2,3,'color']);
for (let item of set.entries()) {
    console.log(item);
}