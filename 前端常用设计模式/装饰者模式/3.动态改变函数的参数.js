Function.prototype.before = function(beforeFn) {
    let self = this;
    return function() {
        beforeFn.apply(this, arguments);
        return self.apply(this, arguments);
    }
};

let ajax = function(type, url, param) {
    console.dir(param);
};

ajax('get', 'http://localhost:9000', {src: 'news'});
// 如果遇到CSRF跨域请求伪造，就需要在请求的时候带上Token参数
let getToken = function() {
    return 'Token';
};

ajax = ajax.before(function(type, url, param) {
    param.Token = getToken();
});
// 这时再请求的ajax就会带上Token参数了
ajax('get', 'http://localhost:9000', {src: 'news'});
