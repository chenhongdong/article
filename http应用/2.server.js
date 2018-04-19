const http = require('http');

const server = http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/html;charset=utf8');
    console.log('必胜');


    let contentType = req.headers['content-type'];
    let arr = [];
    req.on('data', function (data) {
        arr.push(data);
    });
    req.on('end', function () {
        let content = Buffer.concat(arr).toString();
        console.log(contentType);
        if (contentType === 'application/json') {
            console.log(JSON.parse(content).name);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            const queryString = require('querystring');
            console.log(queryString.parse(content));
        }

        res.end('曼联');
    });
    

});

server.listen(4000);