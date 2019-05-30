define(function(require) {
    var config = require('js/app/conf/config');
     var command = require('../command/market_preferential');
    var a = {
        _visible: false,
        tpl:{
            market_preferential: require('../../../templates/search/market_preferential.html')
        },
        name: "search_market_preferential",
        containMap: false,
        command: command,
        prepare: function(view_data) {
            this.view_data = view_data;

            var me = this,
                data = this.view_data.data,
                params = this.view_data.params;

            $("#CTextDiv").html(So.View.template(this.tpl.market_preferential,_.extend({
                data: this.view_data.data
            })));
            this.bindEvents();
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

            switch (d.id) {
                case 0:
                    window.history.back();
                    break;
            }
        },
        resize: function() {
        },
        bindEvents: function(){
            var $container, $zoomImg,$thumb,
                currentIndex = 0,
                $imgItems = $('#CTextDiv .box [data-src]'),
                count = $imgItems.length;
            $('#CTextDiv .box img').click(function(){
                    currentIndex = $(this).index();
                var htmlDom = '<div class="super_map_gallery">'+
                    '<div class="super_map_gallery-cont"><div class="super_map_gallery-thumb"><img class="bigimg"  /></div></div>'+
                    '<a  class="super_map_gallery-close"><span>×</span></a>'+
                    '<div class="super_map_gallery-tool">'+
                        '<span class="super_map_gallery-prev">上一页</span>'+
                        '<span class="super_map_gallery-next">下一页</span>'+
                    '</div>'+
                    '<div class="super_map_gallery-mask"></div>'+
                    '</div>';
                if ($('.super_map_gallery').length === 0) {
                    $('body').append(htmlDom);
                    $container = $('.super_map_gallery');
                    $container.addClass('super_map_gallery_show');
                    $thumb = $('.super_map_gallery-thumb', $container);
                    $thumb.css('height', $('.super_map_gallery-cont', $container).height());
                    $zoomImg = $('.super_map_gallery-thumb .bigimg', $thumb);
                    eventInit();
                }
                $zoomImg.removeClass('zoomOut').attr('src', $(this).data('src'));
                $container.addClass('super_map_gallery_show');
                changePageBtn();
            });

            /* 获取翻页源码 */
            function changePageBtn () {
                if (count >= 1) {
                    if (currentIndex === 0) {
                        $('.super_map_gallery-prev', $container).addClass('no');
                    }
                    if (currentIndex >= 1  && currentIndex < count - 1) {
                         $('.super_map_gallery-tool span', $container).removeClass('no');
                    }
                    if (currentIndex === count - 1) {
                        $('.super_map_gallery-next', $container).addClass('no');
                    }
                }
            }
            function eventInit() {
                /* 阻止滑动滚动事件 */
                $('body').on('touchstart,touchmove, touchend, mousewheel', '.super_map_gallery', function(e) {
                    e.preventDefault();
                    return false;
                });

                /* 关闭事件 */
                $('body').on('click', '.super_map_gallery-close', function(e) {
                    $container.removeClass('super_map_gallery_show');
                });

                /* 单击放大 */
                $('body').on('click', '.super_map_gallery-thumb img', function(e) {
                    return false;
                    if ($(this).hasClass('zoomOut')) {
                        $(this).removeClass('zoomOut');
                    } else {
                        $(this).addClass('zoomOut');
                    }
                    e.preventDefault();
                });

                /* 绑定页数事件 */
                $('body').on('click', '.super_map_gallery .super_map_gallery-prev', function(e){
                    if ( currentIndex === 0) {
                        return ;
                    }
                    currentIndex = currentIndex - 1;
                    var prev = $imgItems.eq(currentIndex);
                    $zoomImg.removeClass('zoomOut').attr('src', $(prev).data('src'));
                    changePageBtn()
                });

                $('body').on('click', '.super_map_gallery .super_map_gallery-next', function(e){
                    if ( currentIndex === count - 1) {
                        return ;
                    }
                    currentIndex = currentIndex + 1;
                    var next = $imgItems.eq(currentIndex);
                    $zoomImg.removeClass('zoomOut').attr('src', $(next).data('src'));
                    changePageBtn()
                });
            }
        }
    };

    return a;
});
