const babel = require('@babel/core');
const loaderUtils = require('loader-utils');

function loader(source) {
    const options = loaderUtils.getOptions(this);

    let {code, map, ast} = babel.transform(source, {
        ...options,
        sourceMaps: true,
        filename: this.resourcePath.split('/').pop()
    });
    return this.callback(null, code, map, ast);
}

module.exports = loader;