const query = require('../db');
const debug = require('debug')('crawl:write:tags');

let tags = async function (tags) {
    debug('开始保存标签列表');

    for (let tag of tags) {
        console.log(tag);
        let oldTags = await query(`SELECT * FROM tags WHERE name = ? LIMIT 1`, [tag.name]);

        // 判断是数组并且长达大于0，就需要更新这张表
        if (Array.isArray(oldTags) && oldTags.length > 0) {
            // 如果数据库里已经有记录了，则需要按老的记录id来更新数据
            await query(`UPDATE tags SET name=?,image=?,url=?,subscribe=?,article=? WHERE id=?`, [tag.name, tag.image, tag.url, tag.subscribe, tag.article, oldTags[0].id]);
        } else {
            await query(`INSERT INTO tags(name,image,url,subscribe,article) VALUES(?,?,?,?,?)`, [tag.name, tag.image, tag.url, tag.subscribe, tag.article]);
        }
        debug(`成功保存标签：${tag.name}`);
    }
};

module.exports = {
    tags
}