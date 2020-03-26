const babel = require('@babel/core');
const loaderUtils = require('loader-utils');

function loader(source) {   // source默认是个utf8的字符串
    // 先拿到options的内容
    let options = loaderUtils.getOptions(this);
    // 转化
    let {code, map, ast} = babel.transform(source, {
        ...options,
        sourceMaps: true,
        filename: this.resourcePath.split('/').pop()
    });

    

    return this.callback(null, code, map, ast);
}
module.exports = loader;