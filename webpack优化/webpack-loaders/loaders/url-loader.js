const loaderUtils = require('loader-utils');
const mime = require('mime');

function loader(source) {
    const options = loaderUtils.getOptions(this);
    const limit = options.limit;

    if (limit && limit > source.length) {
        let base64 = source.toString('base64');
        let type = mime.getType(this.resourcePath);
        console.log(type);
        return `module.exports = "data:${type};base64,${base64}"`
    } else {
        // 如果不是base64就正常处理图片，用file-loader
        return require('./file-loader').call(this, source);
    }

}

loader.raw = true;

module.exports = loader;