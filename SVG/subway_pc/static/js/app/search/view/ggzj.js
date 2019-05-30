define(function(require){

  var tpl = {
    So : require('../../../templates/tplg/frame.html'),
    Napp : require('../../../templates/tplg/frame.html')
  }

  var sw, tpl_type;

  return {
    belong : null,
    //citycode,上门或身边首页,身边首页又分惠吃，惠玩，普通
    init : function(cc,type,sub){
      this.belong = type;
      tpl_type = tpl[type];
      var me = this;
      if(type == 'So'){
        if(So.shenbianAdList&&So.shenbianAdList.ad_data&& So.shenbianAdList.cc == cc){
          this.makeAds(So.shenbianAdList.ad_data);
        }else{
          if (!So.shenbianAdList) {
            So.shenbianAdList = {
              ad_data: null,
              cc: cc
            }
          } else {
            So.shenbianAdList.cc = cc;
          }

          sub = (sub) ? sub : "wap_banner";
          sub = (sub == 'huiwan') ? 'haowan' : sub;
          sub = (sub == 'huichi') ? 'haochi' : sub;

          $.ajaxJSONP({
            url: "//shenbian.so.com/gglist?amap_code=" + cc + "&c_from=wap&type=" + sub + "&callback=?",
            success: function(data) {
              if (data.data && data.data.wap_banner && data.data.wap_banner.length > 0) {

                var ua = window.navigator.userAgent.toLowerCase();

                if(ua.indexOf('iphone') > -1||ua.indexOf('ipad') > -1){
                  for(var i =0 ;i < data.data.wap_banner.length;i++){
                      var tmp = data.data.wap_banner[i];
                      tmp.title == '直接送钱'?data.data.wap_banner.splice(data.data.wap_banner.indexOf(tmp),1):"";
                  }
                }

                So.shenbianAdList.ad_data = data.data;
                me.makeAds(data.data);
              }
            }
          });
        }
      }else if(type == 'Napp'){
        if(NAPP.shangmenAdList&&NAPP.shangmenAdList.ad_data&&NAPP.shangmenAdList.cc == cc){
            this.makeAds(NAPP.shangmenAdList.ad_data);
            return;
        }

        if(!NAPP.shangmenAdList){
          NAPP.shangmenAdList = {
            cc:cc,
            ad_data:null
          }
        }else{
          NAPP.shangmenAdList.cc = cc;
        }

        $.ajax({
            async: true,
            type: "GET",
            dataType: "jsonp",
            url:"//shenbian.so.com/gglist?amap_code="+cc+"&c_from=wap&type=w_shangmen_banner&callback=?",
            success: function(data){
                if(data.data&&data.data.w_shangmen_banner&&data.data.w_shangmen_banner.length > 0){

                  var ua = window.navigator.userAgent.toLowerCase();

                  if(ua.indexOf('iphone') > -1||ua.indexOf('ipad') > -1){
                    for(var i =0 ;i < data.data.w_shangmen_banner.length;i++){
                      var tmp = data.data.w_shangmen_banner[i];
                      tmp.title == '直接送钱'?data.data.w_shangmen_banner.splice(data.data.w_shangmen_banner.indexOf(tmp),1):"";
                    }
                  }

                  NAPP.shangmenAdList.ad_data = {};
                  NAPP.shangmenAdList.ad_data.wap_banner = data.data.w_shangmen_banner;
                  me.makeAds(NAPP.shangmenAdList.ad_data);
                }
            }
        });
      }
    },
    makeAds : function(data){
      if (sw) {
        sw.removeAllSlides();
        sw.destroy(true);
        sw = null;
      }
      $('.cats-wrapper').empty();

      //if (!data || !data.wap_banner || !data.wap_banner.length) return;

      for(var i = 0, len = data.wap_banner.length;i< len;i++){
        data.wap_banner[i].type = (navigator.userAgent.indexOf("mso_app") > -1) ? 'msoapp_ad_' + (i + 1) : 'wap_ad_' + (i + 1);
        data.wap_banner[i].belong = this.belong;
      }

      var image_height = $(window).width()/(720/200);
      data.image_height = image_height;

      var guanggao_frame = $(_.template(tpl_type)(data));

      $('.cats-wrapper').append(guanggao_frame);

      if(data.wap_banner.length > 1){
        sw = new Swiper('.swiper-container', {
          pagination: '.swiper-pagination',
          lazyLoading: true,
          autoplay: 4000,
          loop: true,
          autoplayDisableOnInteraction: false
        });
      }
      //针对uc浏览器计算起始高度
      // if(navigator.userAgent.indexOf('UCBrowser') > -1){
      //   var h = $(window).width()/(720/200);
      //   $('.cats-wrapper').height(h);
      //   $('.swiper-container').height(h);
      //   $('.swiper-wrapper').height(h);
      //   $('.swiper-slide').height(h);
      // }
    }
  }
})
