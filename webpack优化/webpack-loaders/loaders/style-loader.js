const loaderUtils = require('loader-utils');

function loader(source) {
    // 在style-loader中导出一个脚本

    let str = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(source)};
        document.head.appendChild(style);
    `;
    return str;
}
// 在style-loader上写了pitch，后面的都不走了，自己的也不走了

// style-loader         这些都是剩余的请求，less-loader!css-loader!style.less
loader.pitch = function(remainingRequest) { // 剩余的请求
    // 让style-loader去处理剩余的请求

    // require引入inline-loader，返回的就是css-loader处理好的结果
    // loaderUtils.stringifyRequest会把绝对路径转成相对路径
    let str = `
        let style = document.createElement('style');
        style.innerHTML = require(${loaderUtils.stringifyRequest(this, '!!' + remainingRequest)});
        document.head.appendChild(style);
    `;
    return str;
}

module.exports = loader;