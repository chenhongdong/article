const query = require('../db');
const debug = require('debug')('crawl:article:write');

// 保存文章的详情与文章和标签的关系
let articles = async function (list) {
    debug('写入文章列表');

    // 循环文章列表的每一个元素，依次保存
    for (let article of list) {
        let old = await query('SELECT * FROM articles WHERE id=? LIMIT 1', [article.id]);

        if (Array.isArray(old) && old.length) {
            // 更新文章
            let oldArticle = old[0];
            await query('UPDATE articles SET title=?,href=?,content=? WHERE id=?', [article.title, article.href, article.content, oldArticle.id]);
        } else {
            await query('INSERT INTO articles(id,title,href,content) VALUES(?,?,?,?)', [article.id, article.title, article.href, article.content]);
        }

        // 现在处理文章和标签的关系，往关联表里插，关联的东西比较麻烦
        // 直接把关系全删掉，再全部插入
        await query('DELETE FROM article_tag WHERE article_id=?', [article.id]);

        const where = "('" + article.tagNames.join("','") + "')"; // ('前端','后端')
        // 按照标签的名称去查询标签的数组
        const tagSQL = `SELECT id FROM tags WHERE name IN ${where}`;
        const tagIds = await query(tagSQL);

        for (let row of tagIds) {
            await query('INSERT INTO article_tag(article_id,tag_id) VALUES(?,?)', [article.id, row.id]);
        }
    }
};

module.exports = {
    articles
}