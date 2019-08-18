const express = require('express');
const app = express();
const path = require('path');
const query = require('../db');


// 模板引擎
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);

// 首页路由
app.get('/', async (req, res) => {
    let tagId = req.query.tagId;
    let tags = await query('SELECT * FROM tags');
    tagId = tagId || tags[0].id;
    let articles = await query('SELECT articles.* FROM article_tag INNER JOIN articles ON article_tag.article_id=articles.id WHERE article_tag.tag_id=?', [tagId]);

    res.render('index', { tags, articles });
});

// 详情页
app.get('/detail/:id', async (req, res) => {
    const id = req.params.id;
    let articles = await query('SELECT * FROM articles WHERE id=?', [id]);
    res.render('detail', { article: articles[0] });
});



app.listen(7000);