const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crwal:read:tags');

const url = 'https://juejin.im/welcome/frontend';

let articles = async function(url, tagName) {
    debug(`开始读取${tagName}标签下面的文章列表`);

    let options = {
        url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    let $ = await request(options);
    let list = [];
    let items = $('.item .title');
    for (let i=0;i<items.length;i++) {
        let article=$(items[i]);
        let href = article.attr('href').trim();
        let title=article.text().trim();
        let id=href.match(/\/(\w+)$/)[1];
        href='https://juejin.im'+href;
        let articleDetail = await readArticle(id,href);
        list.push({
            href,
            title,
            id,
            content:articleDetail.content,
            tags:articleDetail.tags
        });
    }

    
    return request(options).then($ => {
        let list = [];
        let items =$('.item .title');
        for (let i=0;i<items.length;i++) {
            let article=$(items[i]);
            let href = article.attr('href').trim();
            let title=article.text().trim();
            let id=href.match(/\/(\w+)$/)[1];
            href='https://juejin.im'+href;
            let articleDetail = await readArticle(id,href);
            list.push({
                href,
                title,
                id,
                content:articleDetail.content,
                tags:articleDetail.tags
            });
        }
        return list;
    });
};

(async function() {
    let test = await articles(url);
    console.log(test);
})();