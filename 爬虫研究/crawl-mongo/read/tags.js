const request = require('request-promise');
const cheerio = require('cheerio');
const debug = require('debug')('crawl:read:tags');

let tags = async function(url) {
    debug('开始读取标签');
    let opts = {
        url,
        transform: function(body) {
            return cheerio.load(body);
        }
    };

    return request(opts).then($ => {
        // 存放全部标签的数组
        let result = [];
        // 获取标签列表元素
        let $list = $('.tag-list').find('.item');

        $list.each((index, item) => {
            let $ele = $(item);
            // 标签图片
            let image = $ele.find('.thumb').first();
            let imageUrl = image.data('src').trim();
            // 标签名称
            let name = $ele.find('.title').first().text().trim();
            // 订阅人数
            let subscribe = Number($ele.find('.subscribe').first().text().trim().match(/(\d+)/)[1]);
            // 文章数量
            let article = Number($ele.find('.article').first().text().trim().match(/(\d+)/)[1]);
            
            // 把这些需要用到的数据添加到result数组中
            result.push({
                url: `https://juejin.im/tag/${encodeURIComponent(name)}`,
                name,
                image: imageUrl,
                subscribe,
                article
            });
        });
        // console.log('结果： ', result);

        return result.slice(0, 6);
    });
};

/*const url = 'https://juejin.im/subscribe/all';
(async function() {
    let tags = await getTags(url);
})();*/

module.exports = { tags };