const read = require('./read');
const write = require('./write');

const url = 'https://juejin.im/subscribe/all';

(async function() {
    let tags = await read.tags(url);
    
    await write.tags(tags);
})();