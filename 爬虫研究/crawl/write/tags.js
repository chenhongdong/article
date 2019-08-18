const query = require('../db');
const debug = require('debug')('crawl:write:tags');

let tags = async function (tags) {
    debug('开始写入标签');

    for (let tag of tags) {
        let old = await query('SELECT * FROM tags WHERE name=? LIMIT 1', [tag.name]);

        if (Array.isArray(old) && old.length) {
            await query('UPDATE tags SET name=?,image=?,subscribe=?,articles=?,url=? WHERE id=?', [tag.name, tag.image, tag.subscribe, tag.articles, tag.url, old[0].id]);
        } else {
            await query('INSERT INTO tags(name,image,subscribe,articles,url) VALUES(?,?,?,?,?)', [tag.name, tag.image, tag.subscribe, tag.articles, tag.url]);
        }

        debug(`正在写入标签：${tag.name}`);
    }
};


module.exports = tags;