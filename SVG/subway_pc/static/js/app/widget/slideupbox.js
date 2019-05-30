define(function(require) {
    var tpl = require('../../templates/widget/slideupbox.html');
    var SlideUpBox = function(opts){
        this.opts = _.extend({
            wrap: "#bodyMain",
            open: !0,
            content: "",
            "class": "",
            title: "",
            titleStyle: "title",
            height: "auto",
            max_height: ""
        },opts);

        this.create();
    };

    _.extend(SlideUpBox.prototype, {
        create: function() {
            $.isArray(this.opts.content) && (this.opts.content = this.opts.content.join(""));
            var html = So.View.template(tpl, {
                title: this.opts.title,
                titleStyle: this.opts.titleStyle
            });
            var htmls = $(html); 
            this.box = $(htmls[2]);
            this.box.addClass("slide-up-box-wrap");
            $(".slide-up-box .wrap", this.box).addClass(this.opts.class).height(this.opts.height);
            "" != this.opts.max_height && $(".slide-up-box .wrap", this.box).addClass("overflow").css("max-height", this.opts.max_height);
            $(".wrap", this.box).html(this.opts.content);
            this.opts.confirm || $(".confirm", this.box).hide();
            $(this.opts.wrap).append(htmls);

            if (!this.opts.open) {
                this.box.css("display", "none");
                var _height = $(".slide-up-box", this.box).height();
                $(".slide-up-box", this.box).css("bottom", -1 * _height)
            }
            $(".slide-up-box", this.box).addClass("transition");
            this.bind();

        },
        bind: function() {
            var t = this;
            $(".cancel", t.box).on("click",function() {
                t.opts.cancel && t.opts.cancel();
                t.close();
            });

            $(".confirm", t.box).on("click",function() {
                t.opts.confirm && t.opts.confirm() !== !1 && t.close()
            });

            t.box.on("click",function(i) {
                if($(i.target).hasClass("slide-up-box-wrap") && "complete" === t.box.attr("data-animation")){
                    t.opts.onClose && t.opts.onClose();
                    t.close()
                }
            });

            t.box[0].addEventListener("webkitAnimationEnd",function() {
                t.box.attr("data-animation", "complete")
            },!1)
        },
        close: function() {
            var me = this,
                t = $(".slide-up-box", this.box).height();

            me.box.attr("data-animation", "processing");
            me.recoverPageScroll();
            $(".slide-up-box", me.box).addClass("transition").css({
                bottom: -1 * t
            });

            me.box.removeClass("animation-fadeIn").addClass("animation-fadeOut");

            setTimeout(function() {
                me.box.css({
                    display: "none"
                });
            },140);
        },
        open: function() {
            //必须先修改整个页面的高度，再显示box，否则在UC浏览器上有问题
            this.forbidPageScroll();
            var me = this;

            setTimeout(function(){
                me.box.css({
                    display: "block"
                });
                $(".slide-up-box", me.box).css({
                    display: "block",
                    bottom: 0
                });
                me.box.removeClass("animation-fadeOut").addClass("animation-fadeIn");
                me.box.attr("data-animation", "processing");                
            },100);
        },
        recoverPageScroll: function() {
            $("html, body").css({
                height: "",
                overflow: ""
            })
        },
        forbidPageScroll: function() {
            $("html, body").css({
                height: "100%",
                overflow: "hidden"
            })
        }
    });

    return SlideUpBox;
});