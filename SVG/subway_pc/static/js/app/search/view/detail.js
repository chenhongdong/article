define(function(require) {
    var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').detail;
    var command = require('../command/detail');
    var a = {
        _visible: false,
        tpl:{
            ftel: require('../../../templates/search/ftel.html'),
            PoiText: require('../../../templates/search/detail.html'),
            place_top:{
                '0': require('../../../templates/search/detail/top_default.html'),
                '1': require('../../../templates/search/detail/top_catering.html'),
                '2': require('../../../templates/search/detail/top_movie.html'),
                '3': require('../../../templates/search/detail/top_zuche.html'),
                '5': require('../../../templates/search/detail/top_gouwu.html'),
                '8' : require('../../../templates/search/detail/top_viewpoint.html'),
                '9' : require('../../../templates/search/detail/top_soufang.html'),
                '10': require('../../../templates/search/detail/top_universitie.html'),
                '11': require('../../../templates/search/detail/top_hospital.html'),
                '12' : require('../../../templates/search/detail/top_park.html'),
                '15' : require('../../../templates/search/detail/top_catering.html'),
                '16' : require('../../../templates/search/detail/top_catering.html'),
                '17' : require('../../../templates/search/detail/top_zuche.html'),
                '18' : require('../../../templates/search/detail/top_catering.html')
            },
            place_content: {
                '0':require('../../../templates/search/detail/default.html'),
                '1' : require('../../../templates/search/detail/catering.html'),
                '3' : require('../../../templates/search/detail/hotel.html'),
                '8' : require('../../../templates/search/detail/viewpoint.html'),
                '9' : require('../../../templates/search/detail/soufang.html'),
                '11' : require('../../../templates/search/detail/hospital.html'),
                '12' : require('../../../templates/search/detail/park.html'),
                '14': require('../../../templates/search/detail/changguan.html'),//damai...
                '15' : require('../../../templates/search/detail/catering.html'),
                '16' : require('../../../templates/search/detail/catering.html'),
                '17' : require('../../../templates/search/detail/zuche.html'),
                '18' : require('../../../templates/search/detail/catering.html')
            }
        },
        name: "search_detail",
        logname: "poitextpage",
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params;

            //数据id失效;
            if(data.failure){
                So.Gcmd.changeHash(config.MAIN_PAGE, {noChangeHash:true});
                return;
            }

            var c = params.index;
            var poi = data;
            var detail_type = poi.detail.rich_type || 0;
            var place_top_tpl = this.tpl.place_top[detail_type] || this.tpl.place_top[0] || '';
            var place_content_tpl = this.tpl.place_content[detail_type] || this.tpl.place_content[0] || '';
            if (poi.tel == "" || poi.tel == null) {
                poi.ftel = ""//"暂无"
            } else {
                poi.ftel = "";
                var g = poi.tel.split(";");
                for (var d = 0; d < g.length; ++d) {
                    if (g[d] != "") {
                        poi.ftel += So.View.template(this.tpl.ftel, {
                            tel: g[d],
                            pguid: poi.pguid
                        }) + "&nbsp;&nbsp;"
                    }
                }
            }
            poi.faddress = (poi.address == "" || poi.address == null) ? "暂无" : poi.address;
            !poi.detail && (poi.detail = {});
            poi.show_result_header_bar=show_result_header_bar;//m.so.com头部统一框时是否有列表结果bar
                poi.headerLabel = '<span>360地图</span>';
                if(poi.detail.rich_type && poi.detail.rich_type == 17){
                    poi.headerLabel = '租车详情';
                }

            poi.sources = [];
            if(poi.detail.source){
                $.each(poi.detail.source,function(k,v){
                    if(v.site){
                        poi.sources.push({
                            cname:v.ename,
                            name:v.site,
                            url:v.url
                        })
                    }
                });
            }
            poi.goback = 3;
            if (params.from == 'poishare') {
                poi.goback = 5;
            }

            //当前时间的 时
            poi.curHour = new Date(So.now).getHours();

            if(place_top_tpl){
                poi.place_top_info = So.View.template(place_top_tpl, poi);
            }

            if(place_content_tpl){
                poi.place_content_info = So.View.template(place_content_tpl, poi);
            }

            poi.is_wzgf = (poi.isWzgfPoi == true);//查看是否为违章高发

            $("#CTextDiv").html(So.View.template(this.tpl.PoiText, poi))
        },
        getData: function(params, callback){
            So.PoiService.poiDetail(params.pguid, function(info){
                callback(info.poi);
            })
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        cmd: function(d) {
            var view_data = this.view_data,
                data = view_data.data;
            var currentCity =  So.CityData.citycode();
            var nav_type = parseInt(So.Cookie.get('nav_type')) || 1;
            var map_plugin_installed = config.getMapPluginInstalled().plugin;
            if(currentCity != data.firstCity){
                nav_type = 2;
            }
            var  routeTypes = {
                '1': 'bus',
                '2': 'drive',
                '3': 'walk'
            };
            switch (d.id) {
                case 0:
                    monitor.click.start()

                    if (map_plugin_installed) {
                        So.goToHere(data.name||data.address, data.x, data.y, '', '', '', routeType, 'wap_map_detail');
                    }else{
                        So.Gcmd.changeHash('route/index', {
                            params:{
                                start: {
                                    name: data.name||data.address,
                                    x: data.x,
                                    y: data.y
                                }
                            }
                        });
                    }
                    break;
                case 1:
                    // monitor.click.end()
                    var loc = So.State.getLocation(true);
                    if(loc.state == 1){ //定位成功直跳
                        var routeType = routeTypes[nav_type];
                        if (map_plugin_installed) {
                            So.goToHere(loc.address, loc.x, loc.y, data.name||data.address, data.x, data.y, routeType, 'wap_map_detail');
                        }else{
                            So.Gcmd.changeHash(routeType+"/map", {
                            params:{
                                start: {
                                    name: '您现在的位置('+So.Util.subByte(loc.address,16)+')',
                                    x: loc.x,
                                    y: loc.y
                                },
                                end: {
                                        name: data.name||data.address,
                                        x: data.x,
                                        y: data.y
                                },
                                city: currentCity
                            },
                            noChangeHash: true
                           });
                        }
                    }else{
                        if (map_plugin_installed) {
                            So.goToHere('', '', '', data.name||data.address, data.x, data.y, routeType, 'wap_map_detail');
                        }else{
                            So.Gcmd.changeHash('route/index', {
                                params:{
                                    end: {
                                        name: data.name||data.address,
                                        x: data.x,
                                        y: data.y
                                    }
                                }
                            });
                        }
                    }
                    break;
                case 2:
                    monitor.click.cross()

                    So.Gcmd.changeHash("search/nearby", {
                        params: {
                            center: {
                                name: data.name || data.address,
                                x: data.x,
                                y: data.y
                            },
                            city: data.firstCity || data.city
                        }
                    });
                    break;
                case 3:
                    window.history.back();
                    break;
                case 4:
                    So.Gcmd.changeHash("search/detail_map", this.view_data);
                    break
                case 5:
                    if(document.referrer){
                        history.back();
                    }else{
                        So.Gcmd.changeHash("search/index", {});
                    }

                    break
                case 6:
                    So.Gcmd.changeHash("busline/detail", {
                        params:{
                            id: d.lineId
                        }
                    });
                    break;
                case 7:
                    So.Gcmd.changeHash("search/hotel_hour", {
                        list_data: this.view_data,
                        hour_data: d.part,
                        from: 'detail'
                    });
                    break;
            }
        },
        resize: function() {

        }
    };

    return a;
});
