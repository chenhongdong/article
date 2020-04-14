// 抓取内容全靠它了
// request才是真正用来抓内容的包
// request-promise就是让其支持了promise的语法，可以说是request的小弟
// ★要注意一下，request-promise安装执行的时候如果报错了，那么你需要再安装一下它大哥request

// 安装 npm i request request-promise -D
const rp = require('request-promise');
// 将抓取页面的html代码转为DOM，可以称之为是node版的jq
const cheerio = require('cheerio');
// 这个是为了在调试的时候查看日志用的
const debug = require('debug')('movie:read');
// 读取页面的方法
const read = async (url) => {
    debug('开始读取最近上映的电影');

    const opts = {
        url,
        transform: body => {
            return cheerio.load(body);
        }
    };

    return rp(opts).then($ => {
        let result = [];    // 结果数组
        
        $('#screening li.ui-slide-item').each((index, item) => {
            let ele = $(item);
            let name = ele.data('title');
            let score = ele.data('rate') || '暂无评分';
            let href = ele.find('.poster a').attr('href');
            let image = ele.find('img').attr('src');
            let id = href && href.match(/(\d+)/)[1];
            image = image && image.replace(/jpg$/, 'webp');

            if (!name || !image || !href) return;

            result.push({
                name,
                score,
                href,
                image,
                id
            });
            debug(`正在读取电影：${name}`);
        });
        return result;
    });
};

module.exports = read;