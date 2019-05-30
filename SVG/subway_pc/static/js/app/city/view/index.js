define(function(require) {
    var a = {
        _visible: false,
        _init: false,
        tpl:{
            City: require('../../../templates/City.html'),
            CityItemC: require('../../../templates/CityItemC.html'),
            CityItemP: require('../../../templates/CityItemP.html'),
            CityItem0: require('../../../templates/CityItem0.html')
        },
        name: "city_index",
        logname: "changecitypage",
        containMap: false,
        _lastcity: null,
        getcityhtml: function(e, d) {
            var c = d == 0 ? ("CityItem" + (e.type == 0 ? "P" : "0")) : "CityItemC";
            return "<div id='" + e.id + "'>" + So.View.template(this.tpl[c], e) + "</div>"
        },
        prepare: function(f) {
            this.param = f;
            // if (this._init) {
            //     return
            // }
            // this._init = true;
            var d = "";
            var c = this;
            var e = f;
            _.each(e, function(h, g) {
                d += c.getcityhtml(h, 0)
            });
            $("#CTextDiv").html(So.View.template(this.tpl.City, {
                value: d
            }));
            this.cmd({
                id: 0,
                name: "热门城市"
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
        cmd: function(e) {
            switch (e.id) {
                case 0:
                    var d = So.CityData.getData();
                    var c = _.find(d, function(f) {
                        return f.name == e.name
                    });
                    if (this._lastcity != null && this._lastcity.name != c.name) {
                        $("#" + this._lastcity.id).html(So.View.template(this.tpl.CityItemP, this._lastcity))
                    }
                    this._lastcity = c;
                    if (this._lastcity.items == null) {
                        this._lastcity.items = this._lastcity.city.split(",")
                    }
                    $("#" + this._lastcity.id).html(So.View.template(this.tpl.CityItemC, this._lastcity));
                    break;
                case 1:
                    $("#" + this._lastcity.id).html(So.View.template(this.tpl.CityItemP, this._lastcity));
                    break;
                case 2:
                    new So.Command.ChangeCity({
                        city: e.name
                    }).run();
                    break;
                case 3:
                    So.Gcmd.changeHash("search/index", {});
                    break
            }
        }
    };

    return a;
});
