define(function(require) {
    var config = require('js/app/conf/config');
    var userLocation = {
            x: 116.407250,
            y: 39.904520,
            name: "",
            acc: 0,
            error: null,
            from: 'default',
            state: 0, // 1:定位成功,2:城市切换,99:根据360浏览器cookie定位成功
            city: "北京",
            address: '北京'
        },
        tipsLocation = null;//周边搜位置信息

    So.State = {
        traffic_on: false,
        currentUI: null,
        trafficeOn: false,
        lastSearchScene: 0,
        uiTimestamp: 0,
        maxStackLength: 10,
        uiStack: {},
        uiParams: {},
        init: function(old_share) {
            window.onhashchange = this.onHashChange;

            if(!old_share){
                this.onHashChange({
                    type: 'hashchange',
                    from: 'init'
                });
            }else{
                window.location.hash = '';
            }
        },
        onHashChange: function(opts) {
            //处理 路线规划返回逻辑 添加
            //在某些情况下需要清除上一条记录记录
            //使用history.go(-1)清除历史记录，清除后不执行页面绘制，故添加此逻辑
            if(config.stopHashChange){
                config.stopHashChange = false;
                return false;
            }
            //__errorMark__.push('state-onHashChange:11');
            opts = opts || {};

            var hash = opts.hash || window.location.hash.slice(1),
                uiParams = So.State.uiParams,
                view_data,
                view_url,
                view_name,
                _view_name,
                change_from = opts.from || (opts.newURL ? 'browser' : '');

                /*
                *解决访问url中search部分参数&是&amp;时，参数无法识别导致页面报错的问题
                *实例url： //m.map.so.com/#bus/index/start=%E6%88%91%E7%9A%84%E4%BD%8D%E7%BD%AE%24%24116.187251%2C39.915256&amp;end=%E5%8C%97%E4%BA%AC%E5%B8%82%E7%87%95%E9%83%BD%E5%8C%BB%E9%99%A2%24%24116.22969%2C39.892609&amp;city=%E5%8C%97%E4%BA%AC%E5%B8%82&amp;_=803573
                *
                * */
                hash = hash.replace(/&amp;/g,"&");

            //部分手机浏览器在后退时无法返回到首页bug兼容处理
            if(!hash && opts.newURL){
                hash = config.MAIN_PAGE;
                So.Gcmd.changeHash(config.MAIN_PAGE, {
                    onlySetParams: true
                });
            }



            //在一级目录后面添加view目录
            view_url = hash && hash.split('/').slice(0,2);

            //模块名
            view_name = view_url && view_url.join('/');

            if(!So._time.view){//change_from == 'init'){
               //So._time.loadTpl = +new Date;
               _view_name = view_name || config.MAIN_PAGE;
               So._time.view = {};
               So._time.view.name = _view_name;
               So._time.view.tpl = +new Date;
            }

            if(!view_name){
                return;
            }
            view_url.splice(1,0,'view');
            //试图url
            view_url = view_url.join('/');

            if(!uiParams[view_name]){
                uiParams[view_name] = {};
            }
            if(!uiParams[view_name][hash]){
                uiParams[view_name][hash] = {};
            }

            view_data = uiParams[view_name][hash];

            if(opts.type == 'hashchange' && !(view_data && view_data.params)){
                _.extend(view_data, {
                    params: So.State.getParams(view_name, hash)
                })
            }

            //深度克隆view_data，防止数据被修改;
            view_data = _.clone(view_data);
            view_data.data && (view_data.data = So.clone(view_data.data));
            view_data.params && (view_data.params = So.clone(view_data.params));
            view_data.view_params && (view_data.view_params = So.clone(view_data.view_params));


            require.async('js/app/'+ view_url +'.js',function(view){
                //视图文件不存在 容错处理;
                if(!view){
                    //360浏览器在断网情况下能取到错误数据bug处理
                    if(view_name == 'search/list'){
                        return false;
                    }

                    //如果指定view不存在则跳转至首页
                    So.Gcmd.changeHash(config.MAIN_PAGE, {noChangeHash:true});
                    return;
                }
                if(change_from == 'init' && _view_name === So._time.view.name){
                   So._time.view.tpled = +new Date;
                }
                view.__view_name1__ = view_name;
                var state = So.State,
                    uiStack = state.uiStack;
                uiStack[view_url] =/* uiStack[view_url] ||*/ new So.Command.ChangeUI({
                    ui: view,
                    params: view_data,
                    view_name: view_name,
                    hash: hash,
                    change_from: change_from
                });

                uiStack[view_url].run();
            });
            //__errorMark__.push('state-onHashChange:12');
        },
        getParams: function(view_name, hash){
            var hash_params = hash.split('/')[2] || '',
                array_parsms = hash_params.split('&'),
                params = {};


            _.forEach(array_parsms, function(item){
                var _item = item.split('=');
                var key = _item[0];
                var value = So.Gcmd.formatUrl(view_name, key, _item[1], 'obj');

                //过滤脏数据
                if(key == 'mp' && value == '0,0'){
                    return false;
                }
                params[key] = value;
            });


            return params;
        },
        setLocation: function(opts){
            //TODO
            //后续增加from参数验证，from必填，无from不可设置位置信息
            // if(!opts.from){

            // }
            //重置from参数
            userLocation.from = '';
            _.extend(userLocation, opts)
        },
        setTipsLocation: function(opts){
            if(!opts.x || !opts.y || !opts.name){
                return ;
            }
            tipsLocation = _.extend({
                x: 0,
                y: 0,
                name: '',
                address: '',
                city: '',
                istips: true
            }, opts)
        },
        //用户选择的精确点>用户选择的城市或自动获取的点
        getLocation: function(usr){
            return !usr ? (tipsLocation || userLocation) : userLocation;
        },
        removeTipsLocation: function(){
            tipsLocation = null;
            $('#locationtips').removeClass('active');
            if(So.State.currentUI.name == 'search_nearby'){
                $(".nearby-geolocate").css('display', 'block');
            }
            So.Gcmd.changeHash("search/index");
        },
        showLocation: function(){
            var h = userLocation;
            if(tipsLocation){
                $(".nearby-geolocate").css('display', 'none');
                var tt = $('#locationtips');
                tt.find('.inner').html(So.Util.subByte(tipsLocation.name,24));
                tt.addClass('active');
            }else{
                $('#locationtips').removeClass('active');
                if(So.State.currentUI.name == 'search_nearby'){
                    $(".nearby-geolocate").css('display', 'block');
                }
            }
        }
    };

    //使用服务端根据IP查询返回的中心点信息;
    if(So.cityInfo){
        So.State.setLocation(So.cityInfo);
    }

    //根据浏览器在cookie中存储的定位信息进行定位;
    if(window.__clientMsoXY__){
        So.State.setLocation({
            state: 99,
            acc: 50,
            x: window.__clientMsoXY__.x,
            y: window.__clientMsoXY__.y,
            name:'',
            city:'',
            cityid:'',
            address:''
        });
    }
});
