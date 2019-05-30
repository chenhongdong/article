define(function (require, module, exports) {
  var location = So.State.getLocation();
  // //shenbian.so.com/ad/list?c_from=wap&type=wap_cates&amap_code=110100

  return {
    state: 0, // 0代表初始状态 1代表初始化中 2代表已初始化过
    storage: {},
    tpl: require('../../../templates/search/neayby/operation_ad.html'),
    init: function () {
      if(this.state === 0){
        return this.getAdsData();
      }
      if(this.state === 2 && $('.operation-ad-wrap').length === 0){
        return this.render();
      }
    },
    /**
     * query格式化
     * @return {[type]} [description]
     */
    queryFormat: function ( json ) {
      var temp = [];
      for( var k in json ){
        temp.push( k + '=' + json[k] );
      }
      return '?' + temp.join('&');
    },
    /**
     * 获取广告位数据
     */
    getAdsData: function () {
      var query = {
        c_from:  "wap",
        type: "wap_cates",
        amap_code: location.adcode.slice(0,-2) + '00',
        callback: '?'
      }
      $.ajaxJSONP({
        url: "//shenbian.so.com/ad/list" + this.queryFormat(query),
        success: (function(_this) {
          return function (res) {
            _this.state = 0;
            if( +res.errno ) return alert(res.errmsg);
            if( res.data && res.data.wap_cates ) {
              _this.state = 2;
              _this.storage.cates = res.data.wap_cates.slice(0,4);
              _this.render();
            }
          }
        })(this)
      });
      this.state = 1;
    },
    /**
     * 渲染页面
     */
    render: function () {
      if(this.storage.cates.length < 2) return false;
      $('.bottom').after( So.View.template( this.tpl, this.storage ) );
      // $('.operation-ad-wrap').on('click', 'a', function () {
      //   monitor.log( { mod: 'nearby_click', type:'operation_ad', title: $(this).find('strong').html() } , 'click' );
      // });
    }
  }
})
