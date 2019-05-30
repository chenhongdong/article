define(function(require, exports, module) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').subway;
    var tmpl = require('js/subway/common/tmpl');
    var Position = require('js/subway/base/position');
    var util = require('js/subway/common/util');

    module.exports = {
        offset: {
            left: -2,
            top: -10
        },
        init: function(opts) {
            this.opts = opts || {};
            this.data = opts.data;
            this.data.show_app_download = config.ISANDROID;
            this.opts.tplname = this.opts.tplname || 'info_template';
            this.pop_elem = $(tmpl(this.opts.tplname)(this.data));
            $("#subway_renderer").append(this.pop_elem);
            this.bind();

            if(config.ISANDROID && this.opts.tplname == 'info_template'){
                monitor.disp.subway_download_ditie();

                $('.app_download_con .app_download_tip_con').addClass('app_download_tip_hide');
                setTimeout(function(){
                    $('.app_download_con .app_download_tip_con').hide();
                },1000);    
            }
            
        },

        redraw: function(){
            var self = this;
            $('#sw_pw').remove();
            this.pop_elem = $(tmpl(this.opts.tplname)(this.opts.data));
            $("#subway_renderer").append(this.pop_elem);
        },

        bind: function() {
            var self = this,
            sw_pw_tl = $(".sw-pw-tl");
            sw_pw_tl.on("touchstart", function(evt) {
                self.nbSearch();
            });
            sw_pw_tl.on("click", function(evt) {
                elf.nbSearch()
            });
            var sw_pw_tr = $(".sw-pw-tr");
            sw_pw_tr.on("touchstart", function(evt) {
                self.lineSearch()
            });
            sw_pw_tr.on("click", function(evt) {
                self.lineSearch()
            });
            $('#subway_renderer').on('click','.nearest-notice',function(){
                self.opts.tplname = '';
                self.hide();
            });
            $('.app_download_tip_con1').on('touchstart',function(){
                monitor.click.subway_download_ditie();
                setTimeout(function(){
                    window.location.href = "https://ditu.so.com/zt/app/?from=subway_download_ditie";
                },100);
            });
        },

        show: function(pos, func) {
            var pop_elem = this.pop_elem;
            pop_elem.css({
                visibility: "hidden"
            }).show();
            var offsetWidth = this.width = parseFloat(pop_elem.width()),
                offsetHeight = this.height = parseFloat(pop_elem.height());
            pop_elem.css({
                left: pos.x - offsetWidth / 2 + this.offset.left,
                top: pos.y - offsetHeight / 2 + this.offset.top - 6,
                visibility: ""
            }), func && func(offsetWidth / 2, offsetHeight / 2)
        },

        hide: function() {
            this.pop_elem.hide()
        },

        move: function(offsetX, offsetY) {
            var pop_elem = this.pop_elem,
                left = parseFloat(pop_elem.css("left")),
                top = parseFloat(pop_elem.css("top"));
            pop_elem.css({
                left: left + offsetX,
                top: top + offsetY
            })
        },

        setPosition: function(left, top) {
            var pop_elem = this.pop_elem;
            pop_elem.css({
                left: left - this.width / 2 + this.offset.left,
                top: top - this.height + this.offset.top
            })
        },

        getPosition: function() {
            var pop_elem = this.pop_elem;
            return {
                left: parseFloat(pop_elem.css("left")),
                top: parseFloat(pop_elem.css("top"))
            }
        },

        getPoint: function() {
            return new Position(this.data.x, this.data.y)
        },

        destroy: function() {
            $(".sw-pw-tl, .sw-pw-tr, .sw-pw-tc, .sw-pw-content").off();
            this.pop_elem.remove()
        },

        nbSearch:function(){
            var data  = this.data;
            var name = data.name;
            location.href = '/?k='+name;
        },

        lineSearch:function(){
            var me = this;
            var data  = this.data;
            var name = data.name;
            var city = util.queryStrings('city') || 'beijing',
                x = util.queryStrings('x'),
                y = util.queryStrings('y');
            var map_plugin_installed = config.getMapPluginInstalled().plugin;
            var toWapList = function(){
                location.href = '/?type=bus&autosearch=1&src=subway&end='+name;
            };

            //王维强&赵洪乐 要求，取消进入导航APP
            if (0 && map_plugin_installed) {
                $.ajax({
                    url: "https://subway-sug.map.so.com/sug?",
                    async: false,
                    type: "GET",
                    dataType: "jsonp",
                    jsonp: "callback",
                    data: {
                        q: name,
                        c: city
                    },
                    cache: false,
                    success: function(info) {
                        try{
                            var poi = info.result[0];
                            me.goToHere('您现在的位置', x, y, name, poi.x, poi.y, 'bus', 'subway');
                        }catch(e){
                            console.log(e.message);
                            toWapList();
                        }
                    },
                    error: function(h, g, f) {
                        toWapList();
                    }
                });

            }else{
                toWapList();
            }
        },

        poiSearch:function(){
            var data  = this.data;
            var name = data.name;
            location.href = '/?k='+name;
        },

        goToHere:function(scn,sclon,sclat,ecn,eclon,eclat,tramode,from){
            var scn = scn.replace(/\"|\'/,"");
            var ecn = ecn.replace(/\"|\'/,"");
            var msoAppVersion = msoAppVersion || '';
            var scheme_url = "openapp://com.qihoo.msearch.qmap/route?scn="+scn+"&sclon="+sclon+"&sclat="+sclat+"&ecn="+ecn+"&eclon="+eclon+"&eclat="+eclat+"&tramode="+tramode+"&action=topoi&from="+from+"&msoAppVersion="+msoAppVersion;
            var wapSchema = '$web_app#scheme_url:#mse_token#{"app_url":"'+scheme_url+'","web_url":"","leidian_url":"ddd","pkg_name":"包名"}';
            // monitor.click.end({
            //     msoAppVersion:msoAppVersion
            // })
            // monitor.log({
            //     mod: 'route',
            //     type: 'goToHere',
            //     msoAppVersion:msoAppVersion
            // }, 'click');
            console.log(wapSchema.replace('#mse_token', window.mse_token || '#null#'));
        }
    }
});
