define(function(require) {
	var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        tpl: {
            peilian_result: require('../../../templates/peilian/result.html')
        },
        name: "peilian_result",
        logname: "peilianresultpage",
        containMap: false,
        setBodyMainHeight: false,
        prepare:function(d){
        	d.wd = "预定结果";//console.log(d);
            var html = So.View.template(this.tpl.peilian_result,d);
            $('#CTextDiv').html(html);
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $('#CTextDiv').css("display",d);
        },
        cmd:function(c){
        	switch(c.id){
        		case 44:
                   window.history.back();
        		break;
                case 0:
                break;
        	}
        }
    };
    return a;
});