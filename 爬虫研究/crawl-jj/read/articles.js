const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:articles');

const articles = async function (url, tagName) {
    debug('开始读取文章列表');

    let opts = {
        url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(opts).then(async $ => {
        let result = [];
        let titles = $('.entry-list .item .title');

        for (let i = 0; i < titles.length; i++) {
            let $ele = $(titles[i]);
            // 文章链接
            let href = $ele.attr('href').trim();

            // /entry属于广告文章，过滤掉
            if (!href.startsWith('/entry')) {
                // 通过文章的链接得到文章的id
                let id = href.match(/\/(\w+)$/)[1];
                let title = $ele.text().trim();
                href = 'https://juejin.im' + href;
                let { content, tagNames } = await articleDetail(href);

                result.push({
                    id,
                    title,
                    href,
                    content,
                    tagNames
                });

                debug(`读取到文章 ${title}`);
            }
        }
        
        return result;
    });
};

async function articleDetail(url) {
    let opts = {
        url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };
    return request(opts).then($ => {
        const $main = $('.main-container');
        const content = $main.find('.article-content').html();
        const tags = $main.find('.tag-list .tag-title');
        const tagNames = [];

        tags.each((index, item) => {
            tagNames.push($(item).text().trim());
        });

        return { content, tagNames };
    });
};

// // test
// (async function () {
//     let r = await articles('https://juejin.im/tag/%E5%90%8E%E7%AB%AF');
// })();

module.exports = {
    articles
}
