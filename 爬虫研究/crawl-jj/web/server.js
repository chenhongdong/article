const express = require('express');
const app = express();
const { resolve } = require('path');
const query = require('../db');
const bodyParser = require('body-parser');
const session = require('express-session');
const { checkLogin } = require('./middleware/auth');

// 中间件
// 设置bodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// 设置session
app.use(session({
    resave: true,               // 每次都重新保存session
    saveUninitialized: true,    // 保存未初始化的session
    secret: 'crawl'             // 指定密钥
}));
// 传给header模板user
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});


// 设置模板引擎
app.set('view engine', 'html');
app.set('views', resolve(__dirname, 'views'));
app.engine('html', require('ejs').__express);

// 首页路径
app.get('/', async (req, res) => {
    let tagId = req.query.tagId;
    // 查询所有标签的对象
    let tags = await query('SELECT * FROM tags');
    tagId = tagId || tags[0].id;     // 查询标签的id
    // 根据tagId去查找对应的文章列表
    let articles = await query('SELECT articles.* FROM article_tag INNER JOIN articles ON article_tag.article_id=articles.id WHERE article_tag.tag_id=?', [tagId]);
    res.render('index', {
        tags,
        articles
    });
});

// 详情页路由
app.get('/detail/:id', async (req, res) => {
    let id = req.params.id;
    let articles = await query('SELECT * FROM articles WHERE id=? LIMIT 1', [id]);
    res.render('detail', {
        article: articles[0]
    });
});

// 登录
app.get('/login', async (req, res) => {
    res.render('login', { title: '登录' });
});
app.post('/login', async (req, res) => {
    let { email } = req.body;
    let oldUsers = await query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);

    if (Array.isArray(oldUsers) && oldUsers.length) {
        req.session.user = oldUsers[0];
    } else {
        let result = await query('INSERT INTO users(email) VALUE(?)', [email]);
        req.session.user = {
            id: result.insertId,    // insertId是自增的id
            email
        }
    }
    res.redirect('/');
});

// 订阅
app.get('/subscribe', checkLogin, async (req, res) => {
    let tags = await query('SELECT * FROM tags');
    // 拿到当前会话中的user，根据这个user来判断用户
    let user = req.session.user;
    let userTags = await query('SELECT tag_id FROM user_tag WHERE user_id=?', [user.id]);
    let userTagIds = userTags.map(item => item.tag_id);

    tags.forEach(tag => {
        tag.checked = userTagIds.indexOf(tag.id) === -1 ? false : true;
    });
    res.render('subscribe', { title: '请订阅你感兴趣的标签', tags });
});
app.post('/subscribe', async (req, res) => {
    let { tags } = req.body;
    let user = req.session.user;
    console.log(tags);
    // 先直接把user_tag表全删了，之后再把选中订阅的加进去就可以了
    await query('DELETE FROM user_tag WHERE user_id=?', [user.id]);
    for (let i = 0; i < tags.length; i++) {
        await query('INSERT INTO user_tag(user_id,tag_id) VALUES(?,?)', [user.id, parseInt(tags[i])]);
    }
    res.redirect('back');
});

app.listen(5000);