import rp from 'request-promise';
import cheerio from 'cheerio';

const hotnews = async (url) => {
    const opts = {
        url,
        transform: body => {
            return cheerio.load(body);
        }
    };

    return rp(opts).then($ => {
        let result = [];

        $('.item').each((i, item) => {
            let ele = $(item);
            let pos = ele.data('index');
            let href = ele.attr('href');
            let title = ele.find('.title').text();
            let look = ele.find('.hot').text().match(/(\d+)/)[1];

            result.push({
                pos,
                href,
                title,
                look
            });
        });

        return result;
    });
};
export default hotnews;