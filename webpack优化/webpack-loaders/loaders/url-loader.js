const loaderUtils = require('loader-utils');
const mime = require('mime');

function loader(source) {
    const options = loaderUtils.getOptions(this);
    if (options && options.limit && options.limit > source.length) {
        const type = mime.getType(this.resourcePath);
        const base64 = source.toString('base64');
        return `module.exports = "data:${type};base64,${base64}"`;
    } else {
        // 图片就让file-loader处理
        return require('./file-loader').call(this, source);
    }

    return source;
}

loader.raw = true;  // source转成Buffer


module.exports = loader;