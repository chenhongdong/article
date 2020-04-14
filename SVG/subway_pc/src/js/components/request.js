import $ from 'jquery';

const baseInfo = {
    qt: 'inf',
    newmap: 1,
    it: 3,
    ie: 'utf-8',
    f: '[1,12,13]',
    m: 'sbw',
    c: 131,
    ccode: 131
};
// 请求站点首末车经过时间
function reqInfo(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://map.baidu.com',
            dataType: 'jsonp',
            data: { ...baseInfo, ...options },
            success: data => {
                resolve(data);
            },
            error: err => {
                reject(err);
            }
        });
    });
}


const basePath = {
    sid: 7003,
    output: 'json',
    nightflag: 0,
    strategy: 7,
    count: 1
};

function reqPath(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://restapi.map.so.com/api/simple',
            dataType: 'jsonp',
            data: { ...basePath, ...options },
            success: data => {
                resolve(data);
            },
            error: err => {
                reject(err);
            }
        });
    });
}

export {
    reqInfo,
    reqPath
}