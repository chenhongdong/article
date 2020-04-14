class Home {
    constructor(address) {
        this.address = address;
    }
}

let home = new Home('北京');
console.log(home.address);

// !号的意思是导到前面去
// -!不会让文件再去通过pre+normal的loader去处理了
// ! 禁用普通的loader
// !! 什么都不要
// let a = require('!inline-loader!./a.js');

import imgSrc from './1.jpg';

let img = document.createElement('img');
img.src = imgSrc;
document.body.appendChild(img);

import './style.less';


import { xorWith, isEqual } from 'lodash';

let modResult = [
    { key: 'trend', name: '变化趋势' },
    { key: 'demand', name: '需求分布' },
    { key: 'crowd', name: '用户画像' }
];
let arr = [];

let mod = 'c|t|d';
// mod.split('|').forEach(key => {
//     modResult.forEach((item, i) => {
//         let modName = item.key.substring(0, 1);
//         if (modName === key) {
//             arr.push(item);
//         }
//     });
// });
arr = modResult.slice(1);
console.log('1', arr)
// if (arr.length === 0) {
//     arr = [...modResult];
// }
// 取出没有包含在内的元素
let result = xorWith(modResult, arr, isEqual);
console.log(result);
arr = [...arr, ...result];
