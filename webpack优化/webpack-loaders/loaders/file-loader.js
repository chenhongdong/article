const loaderUtils = require('loader-utils');

function loader(source) {
    // 根据content的内容来生成这么一个带hash的扩展名文件
    let filename = loaderUtils.interpolateName(this, '[hash].[ext]', {content: source})
    // 生成文件，发射到打包目录下
    this.emitFile(filename, source);

    return `module.exports="${filename}"`;
}

loader.raw = true;


module.exports = loader;