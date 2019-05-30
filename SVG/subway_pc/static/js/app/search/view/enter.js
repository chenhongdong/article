define(function(require){
    var config = require('js/app/conf/config');
    var Suggest = require('../../common/suggest');
    var callback;
    var hasbindEvent = false;
    var a = {
        _visible: false,
        _init: false,
        name: "search_enter",
        containMap: false,
        setBodyMainHeight: false,        
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                view_data = this.view_data,
                params = view_data.params,
                type = params.type,
                name = params.name || '',
                action = params.action || '',
                keyword = params.keyword,
                _val = keyword || name;

            var placeholder = '输入关键字';
            if(type == 'start'){
                placeholder = '请输入起点';
            }
            if(type == 'end'){
                placeholder = '请输入终点';
            }

            callback = view_data.callback || this.search.bind(this);

            if(action == 'list'){
                callback = this.newSearch.bind(this);
            }

            $("#CTextDiv").html('');

            $('#header-nav-query').prev().html(placeholder);     

            if(!hasbindEvent){

                this.initSug();
                this.bindEvent();
                //第一次进来时，事件还未绑定，需要手动调用一次;
                $('#header-nav-query').trigger('input');
            }

            if( !params.local&&_val) {
                $('#header-nav-query').val(_val)
                $('#header-nav-query').prev().hide();
            }
        },
        initSug: function(){
            var me = this;
            var params = this.view_data.params;

            var suggest = new Suggest({
                element: "#header-nav-query",
                container: "#header-nav-queryHistory", //suggestion容器
                save_history: true, //搜索词进行本地存储;
                callback: function(query, opts){
                    callback(query, opts);
                }
            });

            $('body').on('enter:updateHistory', function(eve, opts){
                opts = opts || {};
                var name = opts.name;
                if(!name){
                    return false;
                }
                suggest.updateHistory(opts);
            });

        },
        visible: function(c) {
            var me = this,
                params = me.view_data.params,
                name = params.name || '';

            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d);
            if(name){
                var n = (name == "您现在的位置" ? '': name);
                $('#header-nav-query').val(n).parent().addClass('show_clear_btn');
            }

            //隐藏搜索频道切换tab
            if(!c){
                //隐藏suggest;
                $('body').trigger('hideSuggest');
                $('#header-nav-query').blur();
            }else{
                //因为在部分手机中，在地图首页点击顶部输入框，再点击返回后，由于键盘弹起，导致页面高度变小，
                //首页地图高度是根据浏览器自适应的，会导致地图先是小的，然后变大，
                //为优化此效果，特添加此代码
                //在离开首页的时候添加高度，进入首页的时候删除高度
                var window_height = document.documentElement.offsetHeight;
                $('html').height(window_height);
                $('#header-nav-query').focus();
            }
        },
        bindEvent: function(){
            hasbindEvent = true;
            var params = this.view_data.params;
            var event_type = 'touchstart';

            //UCBrowser/10.10.8.822 使用touchstart时，scrollTo(0,0)后顶部地址栏会遮挡住部分内容，等其他bug
            //User-Agent: Mozilla/5.0 (Linux; U; Android 4.4.4; zh-CN; Coolpad 8297-T01 Build/KTU84P) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 UCBrowser/10.10.8.822 U3/0.8.0 Mobile Safari/534.30
            if(config.ISANDROID && config.userAgent.indexOf('UCBrowser') > 0){
                event_type = 'click';
            }

            $('#header-nav-query').on('input', function () {
                var _this = $(this);
                if( this.value ) _this.prev().hide()
                else _this.prev().show()
            });

            $('#hd-m-home .g-header-search-form .clear_btn').on(event_type, function(e){
                e.stopPropagation();
                e.preventDefault();
                So.Gcmd.cmd({id:5});
                $('#header-nav-query').trigger('input');

            });

            $('#hd-m-home .g-header-search-form .g-header-search-button').on('click', function(event){
                event.stopPropagation();
                So.Gcmd.cmd({id:1});
            });

            $('#header-nav-queryHistory').on('click', function(event){
                event.stopPropagation();
            });

        },
        search: function (keyword, opts) {
            //判断是否是360统一头部搜索输入框
            opts = opts || {};
            var inputBox = $(".g-header-q");
            var keyword = keyword || inputBox && inputBox.val() || '';
            if ($.trim(keyword) == "") return inputBox.focus();

            inputBox.blur();
            $('.g-header-placeholder').hide()
            var _params = this.view_data.params;
            var pguid = opts.pguid || '',
                address = opts.address || '',
                cat_new = opts.cat_new || '';
            

            //236 省、237 市，走正常搜索流程，不存pguid
            if(cat_new == 236 || cat_new == 237 ){
                pguid = '';
                cat_new = '';
            }
            var params = _.extend(_params, {
                keyword: keyword,
                use_loc_state:1,
                ids: pguid,
                modeType: '',
                local: _params.local&&keyword!=_params.local?_params.local:''
            });

            $('body').trigger('enter:updateHistory', {
                name: keyword,
                pguid: pguid,
                address: address,
                cat_new: cat_new
            });

            //239 公交线、240 地铁线
            //历史记录存id，但搜索时不走pguid搜索逻辑，所以在同步完历史记录后再删除掉id;

            if(cat_new == 239 || cat_new == 240){
                params.ids = '';
            }

            //点击某个有pguid的poi时直接跳转详情页;
            //239 公交线、240 地铁线路 不走这个逻辑
            if(pguid && cat_new != 239 && cat_new != 240){
                var geolocation = So.State.getLocation(true);
                var position;
                if(geolocation.state == 1){
                    position = geolocation;
                }else{
                    position = {x:'',y:''};
                }
                //So.removeLastHistory(function(){
                    window.location.href = "https://m.map.so.com/onebox/?type=detail&id=" + pguid +'&mso_x='+ position.x + '&mso_y=' + position.y + "&d=mobile&src=map_wap&fields=movies_all";
                //});

                return false;
            }
            new So.Command.CitySearch(params).run();

        },
        newSearch: function(keyword, opts){
            opts = opts || {};
            var me = this;
            var view_data = this.view_data;
            var params = view_data.params;
            var callback = view_data.callback;
            var x = opts.x;
            var y = opts.y;
            var address = opts.address;


            //从suggest中点击时，如果有x、y 则直接选中
            if(x && y){
                callback({
                    name: keyword,
                    address: address,
                    x: x,
                    y: y
                });
            }else{
                So.Gcmd.changeHash("search/select_list", {
                    params: {
                        keyword: keyword,
                        type: params.type
                    },
                    callback: function(data){
                        // So.removeLastHistory(function(){
                        //     callback(data);
                        // });
                        callback(data);
                    },
                    noChangeUrl: true
                });
            }
            
        },
        resize: function() {
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                    $('#header-nav-query').blur();
                    window.history.back();
                    break;
                case 1:
                    var sebox = $('#header-nav-query'),
                        val = $.trim(sebox.val());
                    if(!val){
                        //sebox.focus();
                        return false;
                    }
                    callback(val)
                    break;
                case 2:
                case 3:
                    So.SearchScene.cmd(c);
                    break;
                case 4:
                    So.Gcmd.changeHash("search/nearby", {});
                    break;
                case 5:
                    $('#header-nav-query')
                        .val('')
                        .focus()
                        .prev()
                        .show()
                        .parent()
                        .removeClass('show_clear_btn');
                    break;
            }
        }
    };

    return a;
})
