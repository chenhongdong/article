define(function(require, exports, module) {
    So.Cookie = {
        set: function(key, val, domain, utf8) {
            var c = new Date;
            c.setTime(c.getTime() + 1E3);
            var domain = domain ? 'domain='+domain+';':'';
            val && "null" != val && (document.cookie = key + "=" + (utf8?encodeURIComponent(val):escape(val)) + ";"+domain+"expires=Sun, 17-Jan-2038 19:14:07 GMT")
        },
        get: function(key,utf8) {
            for (var b = document.cookie.split("; "), c = 0; c < b.length; c++) {
                var e = b[c].split("=");
                if (key == e[0]) return e[1] ? (utf8?decodeURIComponent(e[1]):unescape(e[1])) : null
            }
            return null
        },
        remove: function(key, b, c) {
            this.get(key) && (document.cookie = key + "=" + (b ? "; path=" + b : "") + (c ? "; domain=" + c : "") + "; expires=Thu, 01-Jan-70 00:00:01 GMT")
        },
        save: function(key, val, expires, path, domain, h) {
            if(!(key != null && val != null)){
                return false;
            }
            key = key + "=" + encodeURIComponent(val);
            if(expires){
                var now = new Date;
                now.setTime(now.getTime() + 864E5 * expires);
                key += "; expires=" + now.toGMTString()
            }
            document.cookie = key + (path ? "; path=" + path : "") + (domain ? "; domain=" + domain : "") + (h ? "; secure" : "")
        }
    };
});
