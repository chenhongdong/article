const query = require('../db');
const debug = require('debug')('crawl:write');

const hotnews = async (hotnews) => {
    debug('开始写入热点新闻');

    for (let news of hotnews) {
        let old = await query('SELECT * FROM hots WHERE id=?', [news.id]);

        if (Array.isArray(old) && old.length) {
            // 更新新闻
            let oldNews = old[0];
            await query('UPDATE hots SET href=?,title=?,num=?,hot=? WHERE id=?', [news.href, news.title, news.num, news.hot, oldNews.id]);
        } else {
            await query('INSERT INTO hots(id,href,title,num,hot) VALUES(?,?,?,?,?)', [news.id, news.href, news.title, news.num, news.hot]);
        }

        debug(`正在写入新闻：${news.title}`);
    }
};

module.exports = hotnews;