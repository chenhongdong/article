const express = require('express');
const path = require('path');
const app = express();
const query = require('../db');

// 设置模板引擎
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);


app.get('/', async (req, res) => {
    let hotnews = await query('SELECT * FROM hots');
    res.render('index', { hotnews });
});


app.listen(8001);