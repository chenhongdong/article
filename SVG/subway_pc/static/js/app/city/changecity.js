define(function(require) {
    var config = require('js/app/conf/config');
    So.Command.ChangeCity = So.Command.Base.extend({
        _run: function(cbk) {
            var b = this;
            var name = this.getParams().city;
            var a = this.getParams().callback;
            So.UIMap.clearMap();
            So.Waiting.show("正在定位 " + name);
            So.PartitionService.byCity(name, function(data) {
                So.Waiting.hide();
                if (data.status == "1" && data.geocodes) {
                    var location = data.geocodes[0].location.split(',');
                    So.CityData.setCity(name, name, location[0], location[1]);
                    //切换城市后设置了xy  搜索时mp使用，导致改为周边搜索
                    So.State.setLocation({
                        x: location[0],
                        y: location[1],
                        state: 2,
                        city: name,
                        address: name
                    });
                    var m = So.State.getLocation();
                    So.UIMap.setCenter(m);
                    if (So.supportSubway(name)) {
                        $('#server-icon_subway').css('display', '');
                        $('#cat-item-sc').css('display', 'none');
                    } else {
                        $('#server-icon_subway').css('display', 'none');
                        $('#cat-item-sc').css('display', '-webkit-box');
                    }
                    So.Gcmd.changeHash("search/index", {
                        params: {
                            center: location[0] + ',' +  location[1],
                            displaylocation: 0    
                        }                        
                    })                    
                } else {
                    So.SplashError.show("无法定位'" + name + "',请更换输入并重试")
                }
                cbk && cbk();
                if (config.CHANGECITYCBK) {
                    config.CHANGECITYCBK($.trim(name), data.status)
                }
            })
        }
    });
});
