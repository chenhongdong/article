function loader(source) {
    console.log('loader3');
    return source;
}

loader.pitch = function() {
    console.log('loader3-pitch');
}

module.exports = loader;