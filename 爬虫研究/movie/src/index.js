const read = require('./read');
const write = require('./write');
const url = 'https://movie.douban.com';

(async () => {
    let movies = await read(url);

    await write(movies);

    process.exit();
})();