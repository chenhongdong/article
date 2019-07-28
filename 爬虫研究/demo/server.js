const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());     // 处理json格式的请求体
app.use(bodyParser.urlencoded({ extended: true }));     // 处理表单格式的请求体

app.post('/post', function (req, res) {
    let body = req.body;
    res.send(body);
});

app.post('/form', function (req, res) {
    let body = req.body;
    res.send(body);
});
// 上传用multer
app.post('/upload', upload.single('avatar'), function(req, res) {
    console.log('请求体formData里的字段对应的内容', req.file);
    res.send(req.body);
});

app.listen(8000);