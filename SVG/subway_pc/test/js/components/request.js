import $ from 'jquery';

const base = {
    qt: 'inf',
    newmap: 1,
    it: 3,
    ie: 'utf-8',
    f: '[1,12,13]',
    m: 'sbw'
};
// 请求站点首末车经过时间
function reqInfo(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://map.baidu.com',
            dataType: 'jsonp',
            data: { ...base, ...options },
            success: (data) => {
                resolve(data);
            },
            error: (err) => {
                reject(err);
            }
        });
    });
}

export {
    reqInfo
}