import v from 'vue';

let a = require('./a');
console.log(a);
import './style';
let b = 'hello h'
document.body.innerHTML = b;
console.log('这是webpack打包的入口文件');

if (module.hot) {
    module.hot.accept();
}