const request = require('request');

// 向服务器发送一个GET请求，请求服务器的数据    GET 
/* request('http://www.baidu.com', (err, response, body) => {
    console.log('状态码', response.statusCode);
}); */


// 向服务器发送一个POST请求     POST

/* 
    options
        url      请求的地址
        method   请求的方法
        json     true表示返回的是json数据格式
        headers  请求头
        body     请求体
*/
/* let options = {
    url: 'http://localhost:8000/post',
    method: 'POST',
    json: true,
    headers: { 'Content-Type': 'application/json'},
    body: { name: '爬虫', time: 2019 }
};

request(options, (err, response, body) => {
    console.log('err', err);
    console.log('body', body);
}); */



// 向服务器发送POST请求，请求体的格式是表单(form)格式   form
/* let options = {
    url: 'http://localhost:8000/form',
    method: 'POST',
    json: true,
    headers: { 'Content-Type': 'application/x-www-urlencoded'},
    form: {name: '爬虫表单格式'}
};

request(options, (err, response, body) => {
    console.log('err', err);
    console.log('form', body);
}); */




// 如果要向服务器提交文件的话，类型就为multipart/form-data
const fs = require('fs');

const url = 'http://localhost:8000/upload';

let formData = {
    name: '爬虫',
    avatar: {
        value: fs.createReadStream('avatar.png'),   // 可读流，存放头像的内容
        options: {
            filename: 'avatar.png',
            contentType: 'image/png'
        }
    }
};

request.post({url, formData}, (err, response, body) => {
    console.log('err', err);
    console.log('body', body);
});






