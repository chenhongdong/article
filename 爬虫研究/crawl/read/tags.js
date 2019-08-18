const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:tags');

let tags = async function (url) {
    debug('开始读取全部标签');

    let opts = {
        url,
        transform: body => {
            return cheerio.load(body)
        }
    };

    return request(opts).then($ => {
        // 用来存储所有抓取到的标签数组
        let result = [];
        $('li.item').each((index, item) => {
            let $ele = $(item);
            let name = $ele.find('.title').text().trim();
            let image = $ele.find('.thumb').data('src');
            let subscribe = $ele.find('.subscribe').text().match(/(\d+)/)[1];
            let articles = $ele.find('.article').text().match(/(\d+)/)[1];

            result.push({
                url: `https://juejin.im/tag/${encodeURIComponent(name)}`,
                name,
                image,
                subscribe: parseInt(subscribe),
                articles: parseInt(articles)
            });

            debug(`当前读取到标签${name}`);
        });

        return result.slice(0, 5);  // 截取5个标签结果就可以了
    });
};

module.exports = tags;