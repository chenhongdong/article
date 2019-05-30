define(function(require) {
    var command = require('../bus-command');
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            detail:require('../../../templates/bus/detail.html')
        },
        name: "bus_detail",
        logname: "busdetailpage",
        lastIndex: -1,
        containMap: false,
        firstSummaryShow:0,
        lastSummaryShow:0,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;
            var me = this,
                data = me.view_data.data,
                params = me.view_data.params;

            //默认参数填充;
            params.index = params.index || 0;

            this.param = data.data;
            $("#CTextDiv").html(So.View.template(this.tpl.detail, _.extend({
                startName: params.start.name,
                endName: params.end.name,
                index: params.index
            },data.route.transits[params.index])));
        },
        visible: function(c) {
            if (this._visible == c) {
                return
            }
            this._visible = c;
            var d = c ? "block" : "none";
            $("#CTextDiv").css("display", d)
        },
        cmd: function(c) {
            var me = this,
                view_data = me.view_data;

            switch (c.id) {
                case 0:
                    window.history.back();
                    break;
                case 1:
                    view_data.params.step = c.s;
                    So.Gcmd.changeHash("bus/map", view_data);
                    break;
                case 11:
                    var step_lis = $('.new_route_detail_bus li');
                    if(!this.firstSummaryShow){
                        for(var i= 2; i <= c.firstFoldingIndex+1;i++){
                            $(step_lis[i]).css('display','block');
                            $(step_lis[i]).find('dd').css('margin-left','10px');
                            this.firstSummaryShow = 1;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('收起');
                    }else{
                        for(var i= 2; i <= c.firstFoldingIndex+1;i++){
                            $(step_lis[i]).css('display','none');
                            $(step_lis[i]).find('dd').css('margin-left','0');
                            this.firstSummaryShow = 0;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('详情');
                    }
                    break;
                case 12:
                    //console.log(c.index,c.lastFoldingIndex,c.maxStepId)
                    var step_lis = $('.new_route_detail_bus li');
                    if(!this.lastSummaryShow){
                        for(var i= c.lastFoldingIndex+4 ; i <= c.maxStepId+3;i++){
                            $(step_lis[i]).css('display','block');
                            $(step_lis[i]).find('dd').css('margin-left','10px');
                            this.lastSummaryShow = 1;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('收起');
                    }else{
                       for(var i= c.lastFoldingIndex+4; i <=c.maxStepId+3;i++){
                            $(step_lis[i]).css('display','none');
                            $(step_lis[i]).find('dd').css('margin-left','0');
                            this.lastSummaryShow = 0;
                        }
                        $('#btn_summary_detail_'+c.index+'_'+c.stepId).text('详情');
                    }
                    break;
            }
        }
    };
    return a;
});