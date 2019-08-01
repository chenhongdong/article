const express = require('express');
const app = express();
const { resolve } = require('path');
const query = require('../db');
const debug = require('debug')('crawl:web:server');

// 设置模板引擎
app.set('view engine', 'html');
app.set('views', resolve(__dirname, 'views'));
app.engine('html', require('ejs').__express);

// 路由
app.get('/', async function (req, res) {
    let tagId = req.query.tagId;

    // 查询所有的标签对象
    let tags = await query('SELECT * FROM tags');
    // 查询标签的id
    tagId = tagId || tags[0].id;
    let articles = await query('SELECT articles.* FROM article_tag INNER JOIN articles ON article_tag.article_id=articles.id WHERE article_tag.tag_id = ?', [tagId]);



    res.render('index', {
        tags,
        articles
    });
});

app.get('/detail/:id', async function(req, res) {
    let id = req.params.id;
    let articles = await query('SELECT * FROM articles WHERE id =? LIMIT 1', [id]);
    res.render('detail', {
        article: articles[0]
    });
});

let CronJob = require('cron').CronJob;
let { spawn } = require('child_process');
let job = new CronJob('*/30 * * * * *', function () {
    debug('开始执行更新的计划任务');
    let task = spawn(process.execPath, [resolve(__dirname, '../main')]);
    task.on('close', function() {
        console.log('更新任务完毕~~~');
    });
});

app.listen(4000);