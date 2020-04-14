const less = require('less');
function loader(source) {
    let css = '';
    less.render(source, (err, result) => {
        css = result.css;
    });
    css = css.replace(/\n/g, '\\n');
    return css;
}

module.exports = loader;