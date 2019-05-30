define(function(require) {

	var m = require('./nearby_app_orders/mediator'),
	    p = require('./nearby_app_orders/proxy');

      require('./nearby_app_orders/event');
      require('./nearby_app_orders/config');

	window.requestAnimFrame = (function(){
      return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( callback ){
      window.setTimeout(callback, 1000 / 60);
      };
    })();
    window.cancelAnimFrame = (function(){
      return window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.oCancelAnimationFrame ||
      window.msCancelAnimationFrame ||
      function( callback ){
      window.clearTimeout(callback, 1000 / 60);
      };
    })();

    /*jCookie 插件*/
    (function ($, document, undefined) {

      var pluses = /\+/g;

      function raw(s) {
        return s;
      }

      function decoded(s) {
        return decodeURIComponent(s.replace(pluses, ' '));
      }

      var config = $.cookie = function (key, value, options) {

        // write
        if (value !== undefined) {
          options = $.extend({}, config.defaults, options);

          if (value === null) {
            options.expires = -1;
          }

          if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
          }

          value = config.json ? JSON.stringify(value) : String(value);

          return (document.cookie = [
            encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path    ? '; path=' + options.path : '',
            options.domain  ? '; domain=' + options.domain : '',
            options.secure  ? '; secure' : ''
          ].join(''));
        }

        // read
        var decode = config.raw ? raw : decoded;
        var cookies = document.cookie.split('; ');
        for (var i = 0, l = cookies.length; i < l; i++) {
          var parts = cookies[i].split('=');
          if (decode(parts.shift()) === key) {
            var cookie = decode(parts.join('='));
            return config.json ? JSON.parse(cookie) : cookie;
          }
        }

        return null;
      };

      config.defaults = {};

      $.removeCookie = function (key, options) {
        if ($.cookie(key) !== null) {
          $.cookie(key, null, options);
          return true;
        }
        return false;
      };

    })(jQuery, document);

    /*处理时间戳*/
    (function($){$.extend({myTime:{CurTime:function(){return Date.parse(new Date())/1000},DateToUnix:function(string){var f=string.split(" ",2);var d=(f[0]?f[0]:"").split("-",3);var t=(f[1]?f[1]:"").split(":",3);return(new Date(parseInt(d[0],10)||null,(parseInt(d[1],10)||1)-1,parseInt(d[2],10)||null,parseInt(t[0],10)||null,parseInt(t[1],10)||null,parseInt(t[2],10)||null)).getTime()/1000},UnixToDate:function(unixTime,isFull,timeZone){if(typeof(timeZone)=="number"){unixTime=parseInt(unixTime)+parseInt(timeZone)*60*60}var time=new Date(unixTime*1000);var ymdhis="";ymdhis+=time.getUTCFullYear()+"-";ymdhis+=(time.getUTCMonth()+1)+"-";ymdhis+=time.getUTCDate();if(isFull===true){ymdhis+=" "+time.getUTCHours()+":";ymdhis+=time.getUTCMinutes()+":";ymdhis+=time.getUTCSeconds()}return ymdhis}}})})(jQuery);

	window.onhashchange = function(){
    handleHash();
  }

	p.init();

	_.templateSettings = {
		evaluate    :/\{\{(.+?)\}\}/g,
		interpolate :/\{\{=(.+?)\}\}/g,
		escape      :/\{\{-(.+?)\}\}/g,
	}
	m.init();

	function handleHash(e){
		m.updateMediator();
	}
});
