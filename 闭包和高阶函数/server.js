const express = require('express');
const app = express();


app.get('/', function(req, res) {
    let result = [
        {
            username: '文章',
            title: '标题'
        },
        {
            username: '内容',
            title: '页面'
        }
    ];
    res.send(result);
}); 

app.listen(1111);