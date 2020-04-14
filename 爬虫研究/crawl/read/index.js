// 创建一个index.js文件，为了方便把涉及到的方法统一导出

const tags = require('./tags');
const articles = require('./articles');

module.exports = {
    tags,
    articles
};