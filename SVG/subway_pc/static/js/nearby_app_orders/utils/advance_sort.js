define(function(require){

	var config = require('js/nearby_app_orders/config');
	var E = require('js/nearby_app_orders/event'),et = config.eventType;
	var data = config.sort_data,$top,$middle,$footer,$shadow;

	var selectStat = [{m:0,sub:-1},{m:0,sub:-1},{m:0,sub:-1},{m:0,sub:-1}];//控制显示选项

	var fd = {};//提交筛选的数据
	var type = ['keyword','range','sort'];
	var attach = {};

	return {
		init : function(c,d){
			var $w = $("<div></div>").appendTo($(c));
			$top = $("<div></div>").addClass('as-top-ul').appendTo($w);
			$middle = $("<div></div>").addClass('as-middle-part').appendTo($w).hide();
			$shadow = $("<div></div>").addClass('as-footer-shadow').appendTo($w).hide().off('click').click(function(e){
				closeDropDown();
			});
			fenxi(d);
			handleTop();
		}
	}

	function fenxi(d){
		if(d.kw){
			var t = d.kw.split('_')[0],s = d.kw.split('_')[1];
			if(data[0][t]){
				if(data[0][t]['sub'][s]){
					selectStat[0] = {m:t,sub:s};
				}else{
					selectStat[0] = {m:t,sub:-1};
				}
			}
		}
		if(d.range){
			selectStat[1] = {m:parseInt(d.range),sub:-1};
		}
		if(d.sort){
			selectStat[2] = {m:parseInt(d.sort),sub:-1};
		}
		if(d.filter){
			attach['filter'] = d.filter;
		}else{
			attach['filter'] = '';
		}
		if(d.prize){
			attach['price'] = d.prize;
		}else{
			attach['price'] = '0';
		}
	}
	function handleTop(){
		$top.empty();
		for(var i = 0; i < data.length;i++){
			var tmp,label,
			    m = selectStat[i]['m'],
			    s = selectStat[i]['sub'];
			if(s == -1){
				tmp = data[i][m]['type'];
				label = data[i][m]['label'];
			}else{
				tmp = data[i][m]['sub'][s];
				if(tmp == "全部"){
					tmp = data[i][m]['type'];
				}
				label = tmp;
				if(data[i][m]['sub_label']){
					label = data[i][m]['sub_label'][s];
				}
			}
			$("<div data-t='t"+i+"'>"+tmp+"<span></span></div>").appendTo($top).off('click').on('click',onC);
			if(i < 3){
				fd[type[i]] = label;
			}
		}
		fd.batch = 1;

		for(var i in attach){
			fd[i] = attach[i];
		}
		console.log(fd);
		E.fire(et.doGetBizInfo,{info:fd});
	}
	function onC(e){
		var l = $(this).data('t');
		switch(l.slice(0,1)){
			case 't':
				if($(this).hasClass('open')){
					closeDropDown();
				}else{
					$(".as-top-ul div").removeClass("open");
					$(this).addClass("open");
					handleMiddle(l.slice(1),0);
				}
			break;
			case 'l':
			    if($(this).hasClass('select')){
			    	return;
			    }
				$(".lp .item").removeClass('select');
				$(this).addClass('select');

				if($(this).data('b') == -1){//没有分支选项的选择

					var data_index = $(this).data('p'),
					    type_index = $(this).data('t').slice(1);
					selectStat[data_index] = {m:type_index,sub:-1};
					handleHash();
					return;
				}else if($(this).data('b') == -2){//多选项的选择
					return;
				}
			    var pi = $(this).data('b');
			    if(data[pi][l.slice(1)]['sub']&&data[pi][l.slice(1)]['sub'].length > 0){
			    	handleRight(data[pi][l.slice(1)]['sub'],pi,l.slice(1));
			    }else{
			    	selectStat[pi] = {m:l.slice(1),sub:-1};
					handleHash();
			    }
			break;
			case 'r':
				selectStat[$(this).data('d')] = {m: $(this).data('tt'), sub: $(this).data('t').slice(1)};
				handleHash();
			break;
			default:
			break;
		}
	}
	function addAttach(){
		var $t = $(this);
		if($t.hasClass('iphoneBtn')){
			if($t.find('span').hasClass('select')){
				$t.find('span').removeClass('select');
			}else{
				$t.find('span').addClass('select');
			}
		}else if($t.hasClass('optionPop')){
			$(".optionPop").removeClass('select');
			$t.addClass('select');
		}
	}
	function handleHash(){
		var str = "#scene=bis_list&kw="+selectStat[0]['m']+"_"+selectStat[0]['sub']+"&r="+selectStat[1]['m']+"&s="+selectStat[2]['m'];
		str += "&f="+attach['filter']+"&p="+attach['price'];
		window.location.hash = str;
	}
	function handleLeft(arr,i){
		var $l = $("<div class='lp'></div>").appendTo($middle), $tl = $("<div></div>").appendTo($l);
		for(var j = 0; j < arr.length;j++){
			if(arr[j]['isHide'])continue;
			var $item;
			if(i == 1 || i == 2){
				$l.width($(window).width());
				$item = $("<div class='item item"+i+"' data-t='l"+j+"' data-b='-1' data-p="+i+">"+arr[j]['type']+"</div>").appendTo($tl).click(onC);
				if(selectStat[i]['m'] == j){$item.addClass('select');}
			}else if(i == 0){
				$item = $("<div class='item item"+i+"' data-t='l"+j+"' data-b="+i+">"+arr[j]['type']+"</div>").appendTo($tl).click(onC);
				if(selectStat[i]['m'] == j){
					$item.addClass('select');
					if(selectStat[i]['sub'] != -1){
						handleRight(data[i][j]['sub'],i,j);
					}else{
						handleRight([],i,j);
					}
				}
			}else if(i == 3){
				$l.width($(window).width());
				$item = $("<div class='item item"+i+"' data-t='l"+j+"' data-b='-2' data-p="+i+">"+arr[j]['type']+"</div>").appendTo($tl);
				if(j < 4){
					$iphoneBtn = $("<span class='iphoneBtn' data-t="+j+"><span class='btn'></span></span>").appendTo($item).click(addAttach);
					if(j == 3&&attach['filter'].indexOf('groupon')!=-1){
						$iphoneBtn.find('span').addClass('select');
					}
					if(j == 2&&attach['filter'].indexOf('no-wait')!=-1){
						$iphoneBtn.find('span').addClass('select');
					}
					if(j == 1&&attach['filter'].indexOf('creditcard')!=-1){
						$iphoneBtn.find('span').addClass('select');
					}
				}else{
					var ls = ['不限','<=100','100-200','>=200'],
					    vals= ['0','0,100','100,200','200'];
					for(var i=0;i < 4;i++){
						$("<span class='optionPop' data-v="+vals[i]+">"+ls[i]+"</span>").appendTo($item).click(addAttach);
					}
					$('.optionPop').eq(vals.indexOf(attach['price'])).addClass('select');
				}
				if(j == 4){
					$("<div class='confirm_btn'><a href='javascript:void(0);'>确定</a></div>").appendTo($tl).click(handleAttach);
				}
			}
		}
	}
	function handleAttach(){
		attach['filter'] = '';
		var tmp = [];
		if($(".iphoneBtn[data-t=3] span").hasClass('select')){
			tmp.push('groupon');
		}
		if($(".iphoneBtn[data-t=2] span").hasClass('select')){
			tmp.push('no-wait');
		}
		if($(".iphoneBtn[data-t=1] span").hasClass('select')){
			tmp.push('creditcard');
		}
		if(tmp.length > 0){
			attach['filter'] = tmp.join(',');
		}
		$.each($('.optionPop'),function(i,v){
			if($(v).hasClass('select')){
				attach['price'] = $(v).data('v');
			}
		});
		handleHash();
	}
	function handleRight(arr,d,t){
		if($('.rp').length)$('.rp').remove();
		$("<div class='rp'></div>").appendTo($middle);
		var $tr = $("<div></div>").appendTo($(".rp"));
		if(arr.length >0){
			for(var m = 0;m < arr.length;m++){
				$("<div class='item item0' data-d="+d+" data-t=r"+m+" data-tt="+t+">"+arr[m]+"</div>").appendTo($tr).click(onC);
			}
		}
	}
	function handleMiddle(i,s){
		$middle.empty();
		
		var d = data[i],la = [],ra = [];

		if(!d||d.length <=0){
			closeDropDown();
			return;
		}
		handleLeft(d,i);
		$middle.css('display','-webkit-box');
		handleShadow(1);
	}
	function handleShadow(s){
		if(s){
			$shadow.height($(window).height() - 38 - $(".lp").height());
			$shadow.css('top',$(".lp").height()+'px');
			$shadow.show();
		}else{
			$shadow.hide();
		}
	}
	function closeDropDown(){
		$(".as-top-ul div").removeClass("open");
		$middle.hide();
		handleShadow(0);
	}
});