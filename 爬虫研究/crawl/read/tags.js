const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:tags');

let tags = async function(url) {
    debug('开始读取标签');
    let options = {
        url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return request(options).then($ => {
        let list = [];
        $('.item').each((index, item) => {
            let $ele = $(item);
            let title = $ele.find('.title').first();
            let image = $ele.find('div.thumb').first();
            let imageUrl = image.data('src').trim();
            let subscribe = $ele.find('.subscribe').first();
            let article = $ele.find('.article').first();
            let name = title.text().trim();

            list.push({
                image: imageUrl,
                name,
                url: `https://juejin.im/tag/${encodeURIComponent(name)}`,
                subscribe: Number(subscribe.text().match(/(\d+)/)[1]),
                article: Number(article.text().match(/(\d+)/)[1])
            });
            debug(`读取到一个新的标签:${name}`);
        });
        return list.slice(0, 3);
    });
};

module.exports = {
    tags
}