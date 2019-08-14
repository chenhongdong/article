const query = require('../db');
const debug = require('debug')('crawl:tags:write');

// 写入数据
let tags = async function (tags) {
    debug('开始保存标签列表');

    for (let tag of tags) {
        let old = await query('SELECT * FROM tags WHERE name = ? LIMIT 1', [tag.name]);

        // 判断老的标签是不是数组
        if (Array.isArray(old) && old.length) {
            // 如果找到的话，说明有这个标签，直接更新操作
            // 如果数据库里已经有记录了，则需要根据老的ID来更新数据
            await query('UPDATE tags SET name=?,image=?,url=?,subscribe=?,article=? WHERE id=?', [tag.name, tag.image, tag.url, tag.subscribe, tag.article, old[0].id]);
        } else {
            await query('INSERT INTO tags(name,image,url,subscribe,article) VALUES(?,?,?,?,?)', [tag.name, tag.image, tag.url, tag.subscribe, tag.article]);
        }

        debug(`成功保存标签： ${tag.name}`);
    }
};

module.exports = {
    tags
}