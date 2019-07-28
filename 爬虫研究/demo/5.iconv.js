const url = 'http://top.baidu.com/buzz?b=26&c=1&fr=topcategory_c1';
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

// encoding: null表示不需要request把响应体的buffer二进制自动转成字符串
request({url, encoding: null}, (err, response, body) => {
    // 把一个gbk的buffer转成一个utf8字符串
    body = iconv.decode(body, 'gbk');

    let $ = cheerio.load(body);
    let movies = [];

    $('a.list-title').each((index, item) => {
        movies.push({
            title: $(item).text()
        });
    });

    console.log('电影', movies);
});