const query = require('../db');
const debug = require('debug')('crawl:write:articles');
// 保存文章的详情和文章和标签的关系
let articles = async function (list) {
    debug('写入文章列表');

    // 循环文章数组的每一个元素
    for (let article of list) {
        let oldArticles = await query(`SELECT * FROM articles WHERE id=? LIMIT 1`, [article.id]);

        if (Array.isArray(oldArticles) && oldArticles.length > 0) {
            let oldArticle = oldArticles[0];
            await query(`UPDATE articles SET title=?,content=?,href=? WHERE id=?`, [article.title, article.content, article.href, article.id]);
        } else {
            await query(`INSERT INTO articles(id,title,href,content) VALUES(?,?,?,?)`, [article.id, article.title, article.href, article.content]);
        }
        // 处理文章和标签的关系（简单处理的方法是全部删除，再全部插入）
        await query(`DELETE FROM article_tag WHERE article_id = ?`, [article.id]);
        // 按照标签的名称去查询标签的数
        let where = "'" + article.tagNames.join("','") + "'";   // ['前端','后端']=>'前端','后端'=>('前端','后端')
        const tagSQL = `SELECT id FROM tags WHERE name IN (${where})`;
        let tagIds = await query(tagSQL); // [{id: 1, id: 2}]
        for (row of tagIds) {
            await query(`INSERT INTO article_tag(article_id, tag_id) VALUES(?,?)`, [article.id, row.id]);
        }
    }
};

module.exports = {
    articles
}