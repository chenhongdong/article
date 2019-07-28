// request是一个模块，封装的是http.request方法
const request = require('request');
const url = 'https://juejin.im/tag/%E5%89%8D%E7%AB%AF';

const fs = require('fs');


/* request(url, (err, response, body) => {
    console.log(err);
    console.log(response.statusCode);
    console.log(body);

    fs.writeFileSync('./tag.html', body);
}); */

request(url, (err, response, body) => {
    let reg = /class="title" data-v-\w+>(.+?)<\/a>/g;
    let titles = [];
    body.replace(reg, (matched, title) => {
        titles.push(title);
    });
    console.log(titles);
});