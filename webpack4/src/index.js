const str = require('./login');
require('./css/style.css');
// import './css/index.less';
console.log(str, '热烈欢迎');
console.log(123)

if (module.hot) {
    module.hot.accept();
}