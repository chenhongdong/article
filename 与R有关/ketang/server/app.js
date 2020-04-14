const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(cors());
app.use(bodyParser.json());
app.use(session({
    resave: true,
    secret: 'ketang',
    saveUninitialized: true
}));

const sliders = require('./mock/sliders');
// 获取轮播图数据
app.get('/getSliders', (req, res) => {
    res.json(sliders);
});
// 获取课程列表/课程分类
const lessons = require('./mock/lessons');
// http://getLessons/vue?offset=0&limit=5
app.get('/getLessons/:category', (req, res) => {
    let category = req.params.category;
    let { offset, limit } = req.query;
    let list = lessons;

    offset = isNaN(offset) ? 0 : parseInt(offset);  // 偏移量
    limit = isNaN(limit) ? 5 : parseInt(limit);     // 每页条数

    if (category !== 'all') {
        list = lessons.filter(item => item.category === category);
    }

    let total = list.length;
    // 分页处理
    list = list.slice(offset, offset + limit);

    res.json({
        list,
        hasMore: total > offset + limit
    });
});

// 用户注册接口
let users = [];
app.post('/reg', (req, res) => {
    let user = req.body;
    users.push(user);

    res.json({
        success: '注册成功'
    });
});

// 用户登录接口   username password
app.post('/login', (req, res) => {
    let body = req.body;
    let user = users.find(item => item.username === body.username && item.password === body.password);

    if (user) {
        req.session.user = user;
        res.json({
            success: '登录成功',
            user
        });
    } else {
        res.json({
            error: '登录失败'
        });
    }
});

app.listen(3000);