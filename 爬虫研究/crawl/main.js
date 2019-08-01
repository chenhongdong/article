const read = require('./read');
const write = require('./write');

const url = 'https://juejin.im/subscribe/all';

(async function() {
    let tags = await read.tags(url);
    
    await write.tags(tags);

    let allArticles = {};
    for (let tag of tags) {
        // 先获取每个标签下面的文章列表
        let articles = await read.articles(tag.url, tag.name);
        // 一个文章可能会对应多个标签，通过文章的id来去重
        articles.forEach(item => allArticles[item.id] = item);
    }

    await write.articles(Object.values(allArticles));

    process.exit();
})();