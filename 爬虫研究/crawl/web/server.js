const express = require('express');
const app = express();
const { resolve } = require('path');
const query = require('../db');
const debug = require('debug')('crawl:web:server');
const bodyParser = require('body-parser');
const session = require('express-session');
// 自定义的中间件
const { checkLogin } = require('./middleware/auth');

// 设置模板引擎
app.set('view engine', 'html');
app.set('views', resolve(__dirname, 'views'));
app.engine('html', require('ejs').__express);

// 获取req.body请求体
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({ extended: true }));

// session
app.use(session({
    resave: true,               // 每次都要重新保存session
    saveUninitialized: true,    // 保存未初始化的session
    secret: 'crawl'             // 指定密钥
}));

// 添加一个中间件提供给header模板user变量
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    next();
});

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

app.get('/detail/:id', async function (req, res) {
    let id = req.params.id;
    let articles = await query('SELECT * FROM articles WHERE id =? LIMIT 1', [id]);
    res.render('detail', {
        article: articles[0]
    });
});

// 登录
app.get('/login', function (req, res) {
    res.render('login', { title: '登录' });
});
app.post('/login', async function (req, res) {
    let { email } = req.body;
    let oldUsers = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
    let user;
    if (Array.isArray(oldUsers) && oldUsers.length > 0) {
        user = oldUsers[0];
    } else {
        let result = await query('INSERT INTO users(email) VALUES(?)', [email]);
        user = {
            id: result.insertId,
            email
        };
    }
    // 把当前的用户信息放在session中，重定向回首页
    req.session.user = user;
    res.redirect('/');      
});


// 订阅路由
app.get('/subscribe', checkLogin, async function (req, res) {
    // 查询标签表
    let tags = await query('SELECT * FROM tags');
    let user = req.session.user;    // 获取当前session中的user
    let userTags = await query(`SELECT tag_id FROM user_tag WHERE user_id = ?`, [user.id]);
    let userTagIds = userTags.map(item => item.tag_id);
    tags.forEach(tag => {
        tag.checked = userTagIds.indexOf(tag.id) !== -1 ? true : false;
    });

    res.render('subscribe', {
        title: '请订阅你感兴趣的标签',
        tags
    });
});
app.post('/subscribe', checkLogin, async function(req, res) {
    let { tags } = req.body;
    let user = req.session.user;
    await query(`DELETE FROM user_tag WHERE user_id = ?`, [user.id]);
    for (let i = 0; i < tags.length; i++) {
        await query('INSERT INTO user_tag(user_id,tag_id) VALUES(?,?)',[user.id,parseInt(tags[i])]);
    }
    res.redirect('back');
});




// 定时计划
let CronJob = require('cron').CronJob;
let { spawn } = require('child_process');
// let job = new CronJob('*/30 * * * * *', function () {
//     debug('开始执行更新的计划任务');
//     let task = spawn(process.execPath, [resolve(__dirname, '../main')]);
//     task.on('close', function () {
//         console.log('更新任务完毕~~~');
//     });
// });

app.listen(4000);