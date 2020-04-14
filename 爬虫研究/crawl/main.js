const url = 'https://juejin.im/subscribe/all';
const read = require('./read');
const write = require('./write');

(async () => {
    let tags = await read.tags(url);

    await write.tags(tags);

    for (let tag of tags) {
        let articles = await read.articles(tag.url, tag.name);

        await write.articles(articles);
    }


    process.exit();
})();