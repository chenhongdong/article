define(function(require) {
    So.Tpl = {
        error: require('../../templates/search/error.html')
    };
    So.View = {
        template: function(b, a, c) {
            return (new So.View.Template(b)).render(a);
        }
    };

    So.View.Template = So.Class.extend({
        init: function(a) {
            this.tpl = a;
            this.template = _.template(a)
        },
        render: function(a) {
            return this.template(a)
        }
    });

    So.View.Base = So.Class.extend({
        _mapSnapshot: {},
        _htmlSnapshot: "",
        data: "",
        fitView: false,
        init: function(a, b) {
            this.data = a
        },
        onLoad: function() {},
        onDestroy: function() {},
        getHtml: function() {
            return ""
        },
        getOverlays: function() {
            return []
        },
        template: function(a) {
            return So.View.template(this.tplkey, a)
        },
        htmlSnapshot: function(a) {
            if (a) {
                this._htmlSnapshot = a
            }
            return this._htmlSnapshot
        },
        mapSnapshot: function(a) {
            if (a) {
                this._mapSnapshot = {
                    center: a.getCenter(),
                    bounds: a.getBounds()
                }
            }
            return this._mapSnapshot
        }
    });
});
