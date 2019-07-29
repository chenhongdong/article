const {tags} = require('./read');

let url = 'https://juejin.im/timeline/career';
let tagList = tags(url);
console.log(tagList);