const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'https://juejin.im/welcome/frontend';

let articles = async function(url) {
    let options = {
        url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

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