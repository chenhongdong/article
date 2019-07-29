const request = require('request');
const cheerio = require('cheerio');

let url = 'https://juejin.im/subscribe/all';

let tags = function(url) {
    request(url, function(err, response, body) {
        let $ = cheerio.load(body);
        $('.item').each(function(index, ele) {
            const title = $(ele).find('.title');
            console.log(title.text());
            
        });
    });
}



tags(url);
