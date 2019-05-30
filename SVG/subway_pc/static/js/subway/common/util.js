define(function(require,exports,module){
	var util = {
		uniqueId:0,
		getId:function (preString) {
			util.uniqueId +=1;
			return preString + util.uniqueId;
		},

		clone:function(o){
			var obj = {};
			for(var id in o) {
				obj[id] = o[id];
			}
			return obj;	
		},

		bindAsEventListener:function(func, object){
			return function(event) {
				return func.call(object, event || window.event);
			};
		},
		
		stopEventBubble:function(e){
			if (e.preventDefault) {
			        e.preventDefault();
		    } else {
		        e.returnValue = false;
		    }

		    if (e && e.stopPropagation)
		        e.stopPropagation();
		    else
		        window.event.cancelBubble=true;
		},

		queryStrings:function(key) {
            var str = (document.location.search.match(new RegExp("(?:^\\?|&)"+key+"=(.*?)(?=&|$)"))||['',null])[1];
            return str === null ? null : decodeURIComponent(str);
		},

		getDevicePixelRatio:function(){
			 return window.devicePixelRatio && window.devicePixelRatio > 1 ? 2 : 1
		},
		
		isAndroid: function() {
			return /android/i.test(navigator.userAgent)
		},

        getCookie: function(name){
            var exp=new RegExp("(?:;)?"+encodeURIComponent(name)+"=([^;]*);?");
            if(exp.test(document.cookie))
                return decodeURIComponent(RegExp['$1']);
            else return null;
        },
        setCookie: function(name, value, expires, path, domain){
            if( expires && !isNaN(expires)) expires=new Date(new Date().getTime()+expires);
            document.cookie=name+"="+escape(value)+(expires?"; expires="+expires.toGMTString():"")+(path?"; path="+path:"; path=/")+(domain?";domain="+domain:"");
        }

	}
	module.exports = util;
});
