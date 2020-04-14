const Map = require('./Map.js');
const m = new Map();
const o = { p: 'Hello World' };

m.set(22, 'content')
m.set(o, 'title')
m.set([1, 2, 3], 'array')
console.log(m.get(o));      // "title"
console.log(m.get('aaa'))   // undefine
m.has(o) // true
// m.delete(o) // true
m.has(o) //
console.log(m.keys());
m.forEach(function (value, key, map) {
    // console.log(key, value);
});


console.log(new Map().get('xxxx'))  // undefined


const map = new Map([
    ['name', '张三'],
    ['title', 'Author']
]);

map.size // 2
map.has('name') // true
map.get('name') // "张三"
map.has('title') // true
map.get('title') // "Author"
console.log(map);


const Map = require('./Map.js');
let m = new Map();
m.set('Jay', 'Jay的Chou');
m.set(true, '真的');
console.log(m.has('Chou'));  // false
console.log(m.size);        // 2
console.log(m.keys());      // [ 'Jay', 'true' ]
console.log(m.values());    // [ 'Jay的Chou', '真的' ]
console.log(m.get('jay'));  // undefined

m.delete(true);
console.log(m.keys());      // [ 'Jay' ]
console.log(m.values());    // [ 'Jay的Chou' ]