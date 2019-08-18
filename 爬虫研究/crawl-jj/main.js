const read = require('./read');
const tagsUrl = 'https://juejin.im/subscribe/all';
const write = require('./write');

(async function() {
    // 先读取标签
    let tags = await read.tags(tagsUrl);
    // 再写入标签数据到数据库中
    await write.tags(tags);

    // 添加一个对象用来防止文章重复，一个文章可以对应多个标签，所以必须要去重的
    let all = {};
    for (let tag of tags) {
        let articles = await read.articles(tag.url, tag.name);
        // 去重，相同的key就会覆盖掉之前的内容
        articles.forEach(item => all[item.id] = item);
    }
    let list = Object.values(all);

    await write.articles(list);

    process.exit();
})();