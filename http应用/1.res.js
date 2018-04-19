let http = require('http');

let server = http.createServer(function(req, res) {
    // write方法不能在end之后调用
    // res.write();
    // res.end();
    // 响应可以设置响应头

    // 默认情况下返回给客户端内容 200
    // res.statusCode = 200;   // 用statusCode来设置状态码
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('name', 'wkk');
    res.sendDate = false;   // 发送日期

    // 取响应头,不会真正的把响应头给客户端
    console.log(res.headersSent);   // 响应头有没有被发送出去，布尔类型
    console.log(res.getHeader('name'));
    console.log(res.removeHeader('name'));


    // 调用write之前才能调用setHeader方法
    // Content-Length: 2
    res.end('finish');
}).listen(3000);