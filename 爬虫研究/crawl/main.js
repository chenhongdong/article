const { tags } = require('./read');

const url = 'https://juejin.im/subscribe/all';

(async function() {
    let tagsArr = await tags(url);
    console.log(tagsArr);
})();