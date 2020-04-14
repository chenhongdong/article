<<<<<<< HEAD
<<<<<<< HEAD
import './style.less';
import './reset.css';
=======
<<<<<<< HEAD
import React, { Component } from 'react';
import { render } from 'react-dom';
=======
import v from 'vue';
>>>>>>> 959131a25cc64a8e1c87140def50a186404bd9d4

=======
// import './style';
import './css/main.less';
let b = 'hello h';
document.body.innerHTML = b;
>>>>>>> d153b84bda05aa59e9b4036117a7ffd5aac39d88
console.log('这是webpack打包的入口文件');

<<<<<<< HEAD
let list = document.getElementById('list');
let li = document.createElement('li');
li.innerHTML = '新的li';
list.appendChild(li);

let obj = {
    singer: '周杰伦',
    songs: '七里香'
};
let arr = ['仙剑奇侠传', '琅琊榜'];
arr.map(item => {
    return item.substring(0,1);
});

function fn (key) {
    let str = '';

    switch (key) {
        case 'a':
            str = 'a';
            break;
        case 'b':
            str = 'b';
            break;
        default:
            str = 'c';
            break;
    }
    return str;
}

fn();
console.log(fn());
let { singer, songs } = obj;
console.log(singer, songs);


let arrA = [
    {name: '周杰伦', songs: '听妈妈的话'},
    {name: '林俊杰', songs: '江南'},
    {name: '王力宏', songs: '改变自己'}
];

let arrB = [
    {name: '林俊杰', songs: '江南'}
];
console.log([...arrA, ...arrB]);

// 如何拿到arrA和arrB里不重复的元素，组成一个新数组
// let newArr = [
//     {name: '周杰伦', songs: '听妈妈的话'},
//     {name: '王力宏', songs: '改变自己'}   
// ]

function test(cb) {
    cb && cb();
}

test(function() {
    test()
})
=======
// class App extends Component {
//     render() {
//         return (
//             <div>
//                 <h3>烟雨年代</h3>
//                 <p>孙露</p>
//             </div>
//         )
//     }
// }

// render(<App />, window.app);
>>>>>>> 959131a25cc64a8e1c87140def50a186404bd9d4
