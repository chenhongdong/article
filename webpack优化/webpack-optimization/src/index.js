// import jquery from 'jquery';
// import moment from 'moment';


// // 手动引入所需要的语言
// import 'moment/locale/zh-cn';

// let r = moment().endOf('day').fromNow();

// console.log(r);


// 引入的react包会先去动态链接库里去找，如果找到了就不进行打包
// 没找到再重新对react进行打包
// import React from 'react';
// import {render} from 'react-dom';

// render(<h1>React</h1>, window.root)


// import calc from './test';

// console.log(calc.add(1, 8))



// 抽离公共代码
// import './a';
// import './b';
// import $ from 'jquery';

// console.log($);

// console.log('index')


// 懒加载
// let btn = document.createElement('button');
// btn.innerHTML = '点击加载';

// btn.addEventListener('click', function() {
//     // es6草案中的语法,通过jsonp动态加载文件，返回一个promise
//     import('./source').then(data => {
//         console.log(data);
//     });
// })

// document.body.appendChild(btn);

import './index.css';