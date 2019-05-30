/**
*
*
*参数说明
*{
  dom:$("#selector"),  //组件的父dom
  start:[1],           //组件中开始的节点
  current:[1],         //组件当前节点
  opeartorFunc:[function(start,type) { //组件滚动时变化方法
    if(type === "add"){
      return start + 1;
    }
    else {
      return start - 1;
    }      
  }]
  }
*
*
*/
define(function(require) {
    var _this;
    var SIZE = 5;//每页多少项
    var HEIHGT = 32; //每项高度
    var tpl = require('../../templates/widget/selector.html')

	function Selector(data) {
       _this = this;
       _this.data = data;
       _this.showDataArr = [];
       if(validationData()) {
           return;
       }
       handleData();//处理数据
       initSelectorDom();//初始化组件dom结构
       bindEvent();//事件绑定
	}

    //验证组件所需参数是否正确
	function validationData(){
		if(!(_this.data || _this.data.dom 
			|| _this.data.start || _this.data.current)){
	        console.log("组件需要参数传递错误！");
			return 0;
		}
	}

	function handleData() {

    var size =  Math.floor(SIZE / 2);
	  for(var j = 0; j < _this.data.current.length; j ++){
         _this.showDataArr[j] = [];
         var i = size;
        
        _this.showDataArr[j][i] = _this.data.start[j];
        while(true) {
          if(_this.showDataArr[j][i] == _this.data.end[j]) break;

          var upData  = _this.data.opeartorFunc[j](_this.showDataArr[j][i],'add');
          _this.showDataArr[j][i + 1] = upData;

          i ++;
        }
        for(var k = 0;k < size; k ++) {
           _this.showDataArr[j].push("");
        } 
	  }
	}

	function bindEvent() {
    _this.data.dom.on('click','.submit',submitClick);
		_this.data.dom.on('click','.cancel',cancelClick);
    initIScroll();
    $(window).on("touchmove",function(ev) {
        ev.preventDefault();
    });

	}
  function initIScroll() {
    var scrollDoms = $(".selector-containtor-item");
    var iscrolls = []; 
    for(var i = 0,len = scrollDoms.length;i < len;i ++) {
        iscrolls[i] = new IScroll(scrollDoms[i],{
                'resizeScrollbars': false,
                'click': true,
                'bounceTime': 1000
            });
        var lis = $(scrollDoms[i]).children("ul").children();
        var currentLi = $(scrollDoms[i]).children("ul").find(".currentData").index();
        iscrolls[i].scrollTo(0,-(currentLi - Math.floor(SIZE / 2))* HEIHGT, 0);
        iscrolls[i].on('scrollEnd', function(){
         scrollToEle(this);
        });
    }
    $(document.body).css("height","100%");
    $(document.body).css("overflow","hidden");
    $(document.getElementsByTagName("html")[0]).css("height","100%");
    $(document.getElementsByTagName("html")[0]).css("overflow","hidden");

  }

  function scrollToEle(scroll, opts) {
            opts = opts || {};
            var scrollTop = Math.abs(scroll.y),
                bounceTime = opts.bounceTime || 0,
                scrollCon = $(scroll.wrapper),
                lis = scrollCon.find("li"),
                ele,
                value;
            if(opts.ele){
                ele = opts.ele;
            }else{
                var currentIndex = Math.round(scrollTop / HEIHGT);
                var index = Math.round(scrollTop / HEIHGT) + Math.floor(SIZE / 2);
                ele = lis.get(index);
             
               
            }
              
            lis.removeClass("currentData");
            $(ele).addClass("currentData");
            scroll.scrollTo(0,-currentIndex * HEIHGT, 1000);
  }

  function removeEvent() {
    _this.data.dom.off('click','.submit',submitClick);
    _this.data.dom.off('click','.cancel',cancelClick);
  }

  function submitClick() {
    $(document.body).css("height","100%");
    $(document.body).css("overflow","auto");
    $(document.getElementsByTagName("html")[0]).css("height","100%");
    $(document.getElementsByTagName("html")[0]).css("overflow","auto");
    var currentLis = $(".currentData");
    var currentDatas = [];

    for(var i = 0,len = currentLis.length;i < len;i ++) {
        currentDatas.push($(currentLis[i]).html());
    }
    _this.data.sunmitClick(currentDatas);
    removeEvent();
  }

  function cancelClick() {
    $(document.body).css("height","100%");
    $(document.body).css("overflow","auto");
    $(document.getElementsByTagName("html")[0]).css("height","100%");
    $(document.getElementsByTagName("html")[0]).css("overflow","auto");
    _this.data.cancelClick();
    removeEvent();
  }


   //初始化组件Dom
	function initSelectorDom() {
        var opratorHtml = '<div class="opr-btn">' +
    							'<div class="cancel">取消</div>' +
    							'<div class="submit">确定</div>' +
    					  '</div>';
    	var containterHtml =  '<div class="selector-containtor">'
    	for(var i=0,len=_this.showDataArr.length;i<len;i++) {
    		var item = _this.showDataArr[i];
        containterHtml += '<div class="selector-containtor-item"><ul class="selector-info" data-index="' + i + '">';
        for(var j = 0,itemLen = item.length;j < itemLen;j ++) {
          if(item[j] != _this.data.current[i]){
            containterHtml +=   '<li>' + (item[j] || '') + '</li>';
          }
          else {
            containterHtml +=   '<li class="currentData">' + (item[j] || '') + '</li>';
          }
        }
    		containterHtml += '</ul></div>'
    	}
      containterHtml += '<div class="currentDataBorder"></div></div>';   
      _this.data.dom.html(opratorHtml + containterHtml);
      
	}



    return Selector;
});