const less = require('less');

function loader(source) {
    let css;
    less.render(source,(err, result) => {
        css = result.css;
    });
    return css;
}

module.exports = loader;