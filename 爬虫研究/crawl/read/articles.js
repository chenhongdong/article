const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:tags');


let articles = async function (url, tagName) {
    debug(`开始读取${tagName}标签下面的文章列表`);

    let options = {
        url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    let $ = await request(options);
    let list = [];
    let items = $('.item .title');
    for (let i = 0; i < items.length; i++) {
        let article = $(items[i]);
        let href = article.attr('href').trim();

        if (!href.startsWith('/entry')) {
            let title = article.text().trim();
            let id = href.match(/\/(\w+)$/)[1];
            href = 'https://juejin.im' + href;
            let { content, tagNames } = await readArticle(id, href);
            list.push({
                href,
                title,
                id,
                content,
                tagNames
            });

            debug(`读取到文章：${title}`);
        }
    }
    return list;
};

async function readArticle(id, url) {
    let options = {
        url,
        transform: function (body) {
            return cheerio.load(body);
        }
    };

    return request(options).then($ => {
        let $main = $('.main-container');
        let title = $main.find('.article-title').text().trim();
        let content = $main.find('.article-content').html();
        let tags = $main.find('.tag-title');
        let tagNames = [];

        tags.each((index, item) => {
            tagNames.push($(item).text());
        });

        return {
            id,
            title,
            content,
            tagNames
        };
    });
}

module.exports = {
    articles,
    readArticle
}