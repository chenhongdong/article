define(function(require){
    var config = require('js/app/conf/config');
    var a = {
        _visible: false,
        _init: false,
        _domNodes: {},
        tpl:{
            index: require('../../../templates/waimai.html'),
            poi: require('../../../templates/waimai-poi.html'),
            list: require('../../../templates/waimai-list.html')
        },
        name: "search_waimai",
        logname: "waimai",
        containMap: false,
        lastSelectItem: null,
        setBodyMainHeight: false,
        ajaxlock: false,
        modes: ['search','no-result','no-position','poi-list','result'],
        setMode: function(mode,data){
            var $root = this.getDomNode('#CTextDiv .mod-waimai');
            $root.removeClass(_.map(this.modes,function(v){return 'view-'+v}).join(' '));
            $root.addClass('view-'+mode);;
            switch(mode){
                case 'search':
                case 'no-result':
                case 'no-position':
                    this.getDomNode('#CTextDiv .header-label').addClass('open-box').find('input').focus;
                    break;
                case 'poi-list':
                    this.getDomNode('body').trigger('hideSuggest');
                    break;
                case 'result':
                    this.getDomNode('#CTextDiv .header-label').removeClass('open-box');
            }
        },
        getDomNode: function(selector){
            return this._domNodes[selector] || (this._domNodes[selector] = $(selector));
        },
        getData: function(opts){
            var me = this,
            loc = So.State.getLocation(),
            params = {
                x: opts.x || loc.x,
                y: opts.y || loc.y,
                page: opts.page || 1 
            },
            successCallback = function(data){
                me.ajaxlock = false;
                var _d = {};
                if(data.code === 0 && data.data.poilist.length > 0){
                    _d = data.data;
                }else{
                    _d.poilist = [];
                }
                var html = So.View.template(me.tpl.list,{
                    pois: _d.poilist || [],
                    pageIndex: _d.page_index + 1,
                    pageCount: Math.ceil(_d.poi_total_num/10) || 1
                });
                $("#CTextDiv .result-wrap").html(html);
                if(_d.poilist.length > 0){
                    me.setMode('result');
                }else{
                    me.setMode('no-result');
                }
                me.bindSuggestion();
                window.scrollTo(0,1);
            },
            failCallback = function(){
                me.ajaxlock = false;
                me.bindSuggestion();
                me.setMode('no-result');
            };

            if(params.x > 0){
                this.param = params;
                this.ajaxlock = true;
                $.ajax({
                    url: "//m.map.so.com/app/waimai/poi?from=wap",
                    type: "GET",
                    cache: !1,
                    data: params,
                    dataType:'jsonp',
                    success: successCallback,
                    fail: failCallback,
                    error: failCallback 
                })
            }else{
                this.bindSuggestion();
                this.setMode('no-position');
            }
        },
        prepare: function(opts) {
            this._domNodes = {};
            //if($('#poi-wrapper').length < 1){
                var html = So.View.template(this.tpl.index);
                this.getDomNode("#CTextDiv").html(html);
            //}
            this.getData(opts);
        },
        bindSuggestion: function(){
            var me = this;
            So.Event.bindHistoryEvent("waimaiInputBox",function(keyword){
                me.searchPoi({keyword:keyword});
            });
        },
        searchPoi: function(opts){
            var param = this.poiparam = {},me = this;
            param.keyword = (opts && opts.keyword) || '',
            param.citycode = opts.citycode || So.CityData.citycode(),
            param.page = opts.page || 1,
            param.pageSize = opts.pageSize || 10,
            param.callback = function(g){
                So.Waiting.hide();
                if (g.querytype == null || g.querytype == "5" || g.querytype == "3" || g.querytype == "2") {
                    if (g.status == "E0") {
                        if (g.content && g.content.is_city) {
                            return;
                        }
                        g.count = Number(g.totalcount);
                        g.page = me.page;
                        g.pageSize = me.pageSize;
                    }
                    g.keyword = param.keyword;
                    if(g.content && g.content.fold && g.content.fold > 0){
                        g.poi = g.poi.slice(0,Number(g.content.fold));
                    }
                    var html = So.View.template(me.tpl.poi,g);
                    me.getDomNode('#poi-wrapper .poi-list-wrap').html(html);
                    me.setMode('poi-list');
                }
            },
            param.qii = false,
            param.cityname = opts.cityname || So.CityData.cityname();
            So.Waiting.show("正在搜索 " + param.keyword);
            So.PoiService.citySearch(param.keyword, param.citycode, param.page, param.pageSize, param.callback, param.qii, param.cityname,{});
        },
        visible: function(c) {
            this._visible = c;
            var d = c ? "block" : "none";
            this.getDomNode("#CTextDiv").css("display", d);
        },
        resize: function() {
        },
        cmd: function(c) {
            switch (c.id) {
                case 0:
                case 1:
                    if(!this.ajaxlock){
                        this.param.page--;
                        this.getData(this.param);
                    }
                    break;
                case 2:
                    if(!this.ajaxlock){
                        this.param.page++;
                        this.getData(this.param);
                    }
                    break;
                case 3:
                    var isSearch = this.getDomNode('#CTextDiv .header-label').hasClass('open-box'),
                    v = this.getDomNode('#waimaiInputBox').val();
                    if(isSearch && v != ''){
                        So.Event.triggerHistory("waimaiInputBox",v);
                    }else{
                        this.setMode('search');
                    }
                    break;
                case 4:
                    So.Gcmd.changeHash("search/nearby", {});
                    break;
                case 5:
                    var url = c.url;
                    window.open(url);
                    break;
                case 6:
                    this.getData(c);
                    break;
            }
        }
    };

    return a;
})
