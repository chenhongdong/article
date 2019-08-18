const read = require('./read');
const url = 'https://news.so.com/hotnews';
const write = require('./write');

(async () => {
    let news = await read(url);

    await write(news);

    // 退出程序
    process.exit();
})();