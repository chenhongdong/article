const request = require('request-promise');
const debug = require('debug')('crawl:read');
const cheerio = require('cheerio');

const hotnews = async (url) => {
    debug('开始读取热点新闻');

    const opts = {
        url,
        transform: body => {
            return cheerio.load(body);
        }
    };

    return request(opts).then($ => {
        let result = [];
        $('#hot-list a.item').each((i, ele) => {
            let item = $(ele);
            let href = item.attr('href');
            let num = item.data('index');
            let title = item.find('.title').text();
            let hot = item.find('.hot').text().match(/(\d+)/)[1];

            result.push({
                href,
                title,
                num,
                hot
            });

            debug(`正在读取文章：${title}`)
        });
        return result;
    });
};

module.exports = hotnews;