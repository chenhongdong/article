define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').user_poi;
    var STORAGE_KEYS = config.STORAGE_KEYS;
    var user_info;

    var user_poi = {
        setHomeOrCompany:function(opts){
            opts = opts || {};
            var type = opts.type;
            var me = this;
            
            So.Gcmd.changeHash('search/enter',{
                params: {
                    action: 'list',
                    type: type
                },
                callback: function(data, opts){
                    var view_params = _.extend({
                        action: 'saveHomeOrCompany',
                        type: type
                    },data);

                    me.saveHomeOrCompany(view_params, {
                        upload: true
                    });

                    //后退;
                    history.go(-1);

                    // So.removeLastHistory(function(){
                    //     So.Gcmd.changeHash('route/index',{
                    //         view_params:view_params
                    //     });
                    // });
                }
            });
        },
        saveHomeOrCompany: function(data, opts){
            data = data || {};
            opts = opts || {};
            var type = data.type;
            var upload = opts.upload || false;
            var name = data.name;
            var address = data.address;
            var x = data.x;
            var y = data.y;
            var storage_keys = {
                'home':STORAGE_KEYS.HOME,
                'company': STORAGE_KEYS.COMPANY
            };
            var storage_key = storage_keys[type];
            var obj = {
                n: name,
                d: address,
                x:x,
                y:y,
                t: (new Date).getTime()
            };

            if(!(type && name && x && y)){
                throw new Error('必要参数确实，请检查！');
            }

            if(!storage_key){
                throw new Error('非法存储，请检查localstorage key 是否正常！');
            }

            So.Util.storageItem("set", storage_key, JSON.stringify(obj));

            var new_data = user_poi.getHomeAndCompany();

            //同步到服务端
            if(upload){
                $('body').trigger('app-sync-homeandcompany', {
                    type: type, 
                    info: new_data[type]
                });    
            }
            
        },
        deleteHomeOrCompany: function(type){
            var storage_keys = {
                'home':STORAGE_KEYS.HOME,
                'company': STORAGE_KEYS.COMPANY
            };
            var storage_key = storage_keys[type];
            So.Util.storageItem("remove", storage_key);
        },
        getHomeAndCompany: function(){
            var storage_keys = {
                'home':STORAGE_KEYS.HOME,
                'company': STORAGE_KEYS.COMPANY
            };
            var info = {};

            _.each(storage_keys, function(item, key){
                var val = So.Util.storageItem("get", item);
                val = JSON.parse(val) || {};

                info[key] = {
                    name: val.n,
                    address: val.d,
                    x: val.x,
                    y: val.y,
                    time: val.t
                };
            });

            //内存存储用户POI信息
            user_info = info;

            return info;
        },
        bindEvent: function(parentNode, childNode, opts){
            opts = opts || {};

            var me = this;            
            var autosearch = opts.autosearch || '1';

            $(parentNode).on('click', childNode, function(e){
                var dom = $(this),
                    type = dom.data('type'),
                    target = $(e.target),
                    action = target.data('action'),
                    _user_info = user_info[type],
                    froms = {
                        'route_index': 'his',
                        'user_index': 'ponit'
                    },
                    currentui_name = So.State.currentUI.name,
                    from = froms[currentui_name] || ''; //打点使用
                    

                if(action == 'edit' || !_user_info.name){
                    if(!_user_info.name){
                        monitor.click[type+"_add"]();
                    }else{
                        monitor.click[type+"_edit"]();
                    }
                    me.setHomeOrCompany({
                        type: type
                    });

                    return false;
                }

                //起点为定位点;
                start = {
                    name: '您现在的位置'
                };

                //终点为家或公司;
                end = _user_info;

                monitor.click[type+"_"+from]();

                So.Gcmd.changeHash('route/index',{
                    params: {
                        start: start,
                        end: end
                    },
                    view_params: {
                        autosearch: autosearch
                    }
                });

            });
        }
    };

    return user_poi;
});
