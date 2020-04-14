const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:articles');

let articles = async function (url, tagName) {
    debug('开始读取文章列表');

    let opts = {
        url,
        transform: body => {
            return cheerio.load(body);
        }
    };

    return request(opts).then(async $ => {
        let result = [];
        let titles = $('.item .title');

        for (let i = 0; i < titles.length; i++) {
            let $ele = $(titles[i]);
            let href = $ele.attr('href');
            // 过滤掉广告类的文章
            if (!href.startsWith('/entry')) {
                let id = href.match(/\/(\w+)$/)[1];
                let title = $ele.text().trim();
                href = 'https://juejin.im' + href;
                let {content, tagNames} = await detail(href);

                result.push({
                    id,
                    href,
                    title,
                    content,
                    tagNames
                });

                debug(`正在读取：${title}`);
            }
        }

        return result;
    });
};

async function detail(url) {
    let opts = {
        url,
        transform: body => {
            return cheerio.load(body)
        }
    };

    return request(opts).then($ => {
        let $main = $('.main-container');
        let content = $main.find('.article-content').html();
        let tags = $main.find('.tag-list .item');
        let tagNames = [];
        tags.each((i, item) => {
            tagNames.push($(item).text().trim());
        });

        return {
            content,
            tagNames
        }
    });
}

(async function () {
    let r = await articles('https://juejin.im/tag/%E5%90%8E%E7%AB%AF', '后端')
})();

module.exports = articles;