define(function(require) {
    var config = require('js/app/conf/config');
    
    So.Command.parseQuery = So.Command.Base.extend({
        _run: function() {
            $('#bodyMain').css('display', 'block');

            var params = So.urltojson(location.href);

            var type = params.type;
            var kw = params.q || params.k || (params.type == 'busline' && params.name) || '';
            var pguid = params.pid || params.pguid;
            var start = routerStr2Ojb(params.start);
            var end = routerStr2Ojb(params.end);
            var passing = [];
            if(params.passing){
                var _passing = params.passing.split(';');
                for(var i=0,l=_passing.length;i<l;i++){
                    passing.push(routerStr2Ojb(_passing[i]));
                }                
            }



            if(kw || params.ids){

                var loc = So.State.getLocation();
                So.Gcmd.changeHash('search/map_list', {
                    params: _.extend({
                        keyword: kw,
                        city: loc.city,
                        mp: loc.state == 1 ? [loc.y, loc.x].join() : ''
                    },params),
                    noChangeHash: true
                });

            }else if(pguid){

                So.Gcmd.changeHash('search/detail', {
                    params: {
                        pguid: pguid
                    },
                    noChangeHash: true
                });
                return false;

            }else if(type == 'route' || ((type == 'bus' || type == 'drive' || type == 'walk' || type == 'bike') && !(start.x && start.y && end.x && end.y))){
                var router = function(){
                    var autosearch = params.autosearch || (start.x && start.y && end.x && end.y ? 1 : '');
                    type = type == 'route' ? '' : type;

                    So.Gcmd.changeHash("route/index", {
                        params: {
                            start: start,
                            end: end,
                            type: type,
                            passing: passing,
                            city: params.city,
                            start_city: params.start_city,
                            end_city: params.end_city,
                            autosearch: autosearch,
                            src: params.src
                        },
                        noChangeHash: true
                    });
                }
                if (params.city) {
                    new So.Command.ChangeCity({
                        city: params.city
                    }).run(function() {
                        router();
                    });
                } else {
                    router();
                }

            }else if(type == 'bus' || type == 'drive' || type == 'walk' || type == 'bike'){

                var router = function(){                    
                    var view = params.view || 'map';

                    //公交默认进入index view；
                    if(type == 'bus' && !params.view){
                        view = "index";
                    }

                    delete params.type;
                    var _params = _.extend({},params,{
                        start: start,
                        end: end,
                        type: params._type
                    });
                    delete _params._type;

                    if(passing && passing.length){
                        _params.passing = passing;
                    }

                    So.Gcmd.changeHash(type + "/" + view, {
                        params: _params,
                        noChangeHash: true
                    });
                }

                router();

            }else if(type == 'busdetail' && params.lineid){

                So.Gcmd.changeHash("busline/detail", {
                    params: {
                        id: params.lineid
                    },
                    noChangeHash: true
                });

            }else if(type == 'map_detail' && params.id){
                So.Gcmd.changeHash('search/map_detail', {
                    params: {
                        ids: params.id,
                        src: params.src
                    },
                    noChangeHash: true
                });
                return false;
            }else if(type){
                delete params.type;
                So.Gcmd.changeHash(type, {
                    params: params,
                    noChangeHash: true
                });
            }

            //显示路况
            if(params.showtf){
                new So.Command.ChangeCity({
                    city: params.city
                }).run(function() {
                    So.Gcmd.traffic();
                });
            }
        }
    });

    var routerStr2Ojb = function(str){
        var name = str;
        var xys,x,y;
        if(/[\d\.]+,[\d\.]+\$\$.+$/.test(str)){
            str = str.split('$$');
            xys = str[0];
            name = str[1];
            xys = xys.split(',');
            x = xys[0];
            y = xys[1];
        }

        return {
            name: name,
            x: x,
            y: y
        }
    };
});
