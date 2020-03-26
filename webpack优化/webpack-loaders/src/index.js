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

// import imgSrc from './1.jpg';

// let img = document.createElement('img');
// img.src = imgSrc;
// document.body.appendChild(img);

import './style.less';