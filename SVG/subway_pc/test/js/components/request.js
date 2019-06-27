import $ from 'jquery';

function request(options) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'https://map.baidu.com',
            dataType: 'jsonp',
            data: {...options},
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
    request
}