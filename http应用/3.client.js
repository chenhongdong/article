const http = require('http');
// node可以做爬虫

let options = {
    hostname: 'localhost',
    port: 4000,
    path: '/',
    method: 'get',
    // 告诉服务端我当前要给你发什么样的数据
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Type': 'application/json',
        'Content-Length': 16
    }
};


let req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log(chunk);
    });
});
// 前后端通宵 靠的都是json字符串



req.end('name=chd&&age=18');    // 注意，Content-Length的长度一定要数好，少了字符被截断，多了就不输出了
// req.end('{"name": "皇马"}');  // 注意，Content-Length的长度一定要数好，少了报错无法解析json串，多了就不输出了