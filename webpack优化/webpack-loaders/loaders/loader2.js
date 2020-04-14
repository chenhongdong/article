function loader(source) {
    console.log('loader2');
    return source;
}

loader.pitch = function(remainingRequest,previousRequest) {
    console.log('loader2-pitch')
    console.log('remaining', JSON.stringify('-!'+remainingRequest))
    return '加油加油';
    // return "module.exports = require(" + JSON.stringify("-!" + remainingRequest) + ");";
}

module.exports = loader;