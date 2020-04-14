const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');
const getHostName = function (str) {
    let { hostname } = url.parse(str);
    return hostname;
};

http.createServer((req, res) => {
    let refer = req.headers['referer'] || req.headers['referrer'];
    let { pathname } = url.parse(req.url);
    let src = path.join(__dirname, 'public', '.' + pathname);

    fs.stat(src, err => {
        if (!err) {
            if (refer) {
                let referHost = getHostName(refer);
                let host = req.headers['host'].split(':')[0];
                
                if (referHost !== host) {
                    // 防盗链
                    fs.createReadStream(path.join(__dirname, 'public', './1.jpg')).pipe(res);
                } else {
                    // 正常显示
                    fs.createReadStream(src).pipe(res);
                }
            } else {
                // 正常显示
                fs.createReadStream(src).pipe(res);
            }
        } else {
            res.end('end');
        }
    });
    
}).listen(8888);