const express = require('express');
const path = require('path');
const query = require('../src/db');
const app = express();

// 设置模板引擎
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);


// 首页路由
app.get('/', async (req, res) => {
    const movies = await query('SELECT * FROM movies');
    res.render('index', { movies });
});

app.listen(9000);