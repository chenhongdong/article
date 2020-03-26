const loaderUtils = require('loader-utils');
// 校验选项
const validate = require('schema-utils');
const fs = require('fs');

function loader(source) {
    const options = loaderUtils.getOptions(this);
    const cb = this.async();    // cb简写了this.callback
    const schema = {
        type: 'object',
        properties: {
            text: {
                type: 'string'
            },
            filename: {
                type: 'string'
            }
        }
    };
    // 校验
    validate(schema, options, 'loader1');


    if (options.filename) {
        // 依赖
        this.dependency(options.filename);

        fs.readFile(options.filename, 'utf8', (err, data) => {
            cb(err, '/**'+data+'**/'+source);
        });
    } else {
        cb(null, '/**'+options.text+'**/'+source)
    }
}

module.exports = loader;