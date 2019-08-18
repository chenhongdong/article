const query = require('../db');
const debug = require('debug')('crawl:write:articles');

let articles = async function (articles) {
    debug('开始写入文章列表');

    for (let article of articles) {
        let old = await query('SELECT * FROM articles WHERE id=? LIMIT 1', [article.id]);

        if (Array.isArray(old) && old.length) {
            let oldArticle = old[0];
            // 更新
            await query('UPDATE articles SET href=?,title=?,content=? WHERE id=?', [article.href, article.title, article.content, oldArticle.id,]);
        } else {
            // 插入
            await query('INSERT INTO articles(id,href,title,content) VALUES(?,?,?,?)', [article.id, article.href, article.title, article.content]);
        }

        debug(`开始写入文章：${article.title}`);

        // 把tag和article写入关联表里，让其进行关联起来
        // 粗暴的方法就是全删了，然后再插入

        await query('DELETE FROM article_tag WHERE article_id=?', [article.id]);

        let where = "('" + article.tagNames.join("','") + "')";
        let tagIds = await query(`SELECT id FROM tags WHERE name IN ${where}`);

        for (let tag of tagIds) {
            await query('INSERT INTO article_tag(article_id,tag_id) VALUES(?,?)', [article.id, tag.id]);
        }
    }
};

module.exports = articles;