const loaderUtils = require('loader-utils');

function loader(source) {
    let filename = loaderUtils.interpolateName(this, '[hash].[ext]', {content: source});
    // 把图片发到dist目录下
    this.emitFile(filename, source);
    return `module.exports = "${filename}"`;
}

loader.raw = true;  // 转成Buffer

module.exports = loader;