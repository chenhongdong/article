/*
    直接打开图片没问题
    在百度的网站上打开图片也没问题
    在我自己的服务器上看就出问题  应该显示一个错误图片

    防盗链也是通过rederer头来搞定的和host进行匹配，如果referer来源和host主机相同就代表本网站的
*/

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
let getHostName = function (str) {
    let { hostname } = url.parse(str);
    console.log(hostname);
    return hostname;
}

http.createServer((req, res) => {
    let refer = req.headers['referer'] || req.headers['referrer'];  // 请求头都是小写的
    // 先看一下refer的值，去和host的值作对比，不相等就需要防盗链了  
    // 要读取文件 返回给客户端
    let { pathname } = url.parse(req.url);
    let p = path.join(__dirname, 'public', '.' + pathname);
    // p代表我要找的文件
    
    // 先判断文件存不存在
    fs.stat(p, err => {
        if (!err) {
            if (refer) {    // 不是所有图片都有来源
                let referHostName = getHostName(refer);
                let host = req.headers['host'].split(':')[0];
                if (referHostName != host) {
                    // 防盗链
                    fs.createReadStream(path.join(__dirname, 'public', './2.png')).pipe(res);
                } else {
                    // 正常显示
                    fs.createReadStream(p).pipe(res);   // 如果路径存在，可以正常显示直接返回
                }
            } else {
                // 正常显示
                fs.createReadStream(p).pipe(res);
            }
        } else {
            res.end();
        }
    })
}).listen(7777);