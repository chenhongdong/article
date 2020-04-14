const loaderUtils = require('loader-utils');

function loader(source) {
    let tag = `
        let style = document.createElement('style');
        style.innerHTML = ${JSON.stringify(source)};
        document.head.appendChild(style);
    `;
    return tag;
}

loader.pitch = function(remainingRequest) {
    console.log(remainingRequest);
    let tag = `
        let style = document.createElement('style');
        style.innerHTML = require(${loaderUtils.stringifyRequest(this, '!!'+remainingRequest)});
        document.head.appendChild(style);
    `;
    return tag;
}

module.exports = loader;