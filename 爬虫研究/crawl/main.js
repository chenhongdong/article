const url = 'https://juejin.im/subscribe/all';
const read = require('./read');
const write = require('./write');

(async () => {
    let tags = await read.tags(url);

    await write.tags(tags);

    process.exit();
})();