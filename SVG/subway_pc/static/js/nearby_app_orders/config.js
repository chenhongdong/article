define(function(require,exports,module){

	var CONFIG = function(){}

	var uas = {"360around":"a","360shenbian":"a","mso_app":"h","360Shake":"s","360HY":"hy","360map":"map"};

	var su = (window.location.host.indexOf('haosou.com')==-1)?"//shenbian.so.com":"//shenbian.haosou.com";

	var userAgent = navigator.userAgent;
    var MSO_APP_VERSION = /.* mso_app\s?\(([\d.]+)\)/i.exec(userAgent);

    var ISIPHONE = userAgent.indexOf('iPhone') > -1;
    var MSOAPP = MSO_APP_VERSION && MSO_APP_VERSION[1];

	module.exports = {
		eventType:{
			doGetInfo:"DO_GET_INFO",
	    	didGotInfo:"DID_GOT_INFO",
	    	doPage:"DO_PAGE",
	    	doPaihao:"DO_PAIHAO",
	    	didGotPaihao:"DID_GOTPAIHAO",
	    	cancelPaihao:"CANCEL_PAIHAO",
	    	didCancelPaihao:"DID_CANCEL_PAIHAO",
	    	doCheckOrder:"DO_CHECK_ORDER",
	    	didCheckOrder:"DID_CHECK_ORDER",
	    	doGetBizInfo:"DO_GET_BIZINFO",
	    	didGotBizInfo:"DID_GOT_BIZINFO",

	    	doCancelAction:"Do_Cancel_Action",
	    	didCancelOrder:"DID_CANCEL_ORDER",

	    	doCheckUserInfo:"DO_CHECK_USERINFO",

	    	doGetMoreItem:"DO_GET_MORE_ITEM",
	    	didGotMoreItem:"DID_GOT_MORE_ITEM",

	    	doDelFav:'DO_DEL_FAV',
	    	didDelFav:'DID_DEL_FAV',

	    	doGetShanghuList:'DO_GET_SHANGHU_LIST',
	    	didGotShanghuList:'DID_GOT_SHANGHU_LIST'
		},

		service_url:su,

		mainPage:"user_panel",

		loadTpl : function(n,d,cb){

            var tpl = _.template(n),
                html = tpl(d);

            $("#container").empty().append(html);

			if(NAPP.cu.handleResize){
				NAPP.cu.handleResize();
			}
            if(NAPP.cu.prep){
                NAPP.cu.prep();
            }
            cb&&cb();
		},
		checkLogin : function(cb){
			var me = this;
			QHPass.getUserInfo(function(data){
				cb(data);
			},function(){
				if(window.__HaoSouFun__ && __HaoSouFun__.login){
					__HaoSouFun__.login();
				}else if(me.checkUA() == "a"){
	        		JTN.getNative("goLogin",{},function(d){});
	        	}else{
	        		window.location.replace("//i.360.cn/login/wap/?src=mpw_around&destUrl="+
		            encodeURIComponent(window.location.href));
	        	}
	        });
		},
		easeOut: function(t,b,c,d){
			return -c *(t/=d)*(t-2) + b;
		},
		showLoading : function(b){
			b?$("#effect-dialog").show():$("#effect-dialog").hide();
		},
		checkCookie : function(c_name){
	        if (document.cookie.length>0)
	        {
	          c_start=document.cookie.indexOf(c_name + "=")
	          if (c_start!=-1)
	          {
	            c_start=c_start + c_name.length+1
	            c_end=document.cookie.indexOf(";",c_start)
	            if (c_end==-1) c_end=document.cookie.length
	            return unescape(document.cookie.substring(c_start,c_end))
	          }
	        }
	        return false;
	     },
	     tip : function(msg){
	     	$("#tip-frame span").text(msg);
	     	$("#tip-frame").fadeIn(600,function(){$(this).fadeOut();})
	     },
		alert: function(msg){
			$("#c-alert .msg").text(msg);
			$("#c-alert a").off('click').click(function(e){
				$("#c-alert").hide();
			});
			$("#c-alert a").css("margin-right",0);
			$("#c-alert a.n-btn").hide();
			$("#c-alert").css("display","-webkit-box");
		},
		confirm:function(msg,cb){
			$("#c-alert .msg").text(msg);
			$("#c-alert a.y-btn").show().off('click').click(function(e){
				$("#c-alert").hide();
				cb();
			});
			$("#c-alert a.n-btn").show().off('click').click(function(e){
				$("#c-alert").hide();
			});
			$("#c-alert").css("display","-webkit-box");
		},
		getQueryString : function(name) {

			if(!NAPP['URL_TMP']){
				NAPP['URL_TMP'] = {};
			}
			var current_url = window.location.href;

			if(NAPP['URL_TMP'][current_url]){
				return NAPP['URL_TMP'][current_url][name]||null;
			}

			var hash;
			var ps = window.location.hash;
            var obj = {};

            if(!ps)return null;
            var hashes = ps.slice(ps.indexOf('#') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                try{
                    obj[hash[0]] = _.escape(decodeURIComponent(hash[1]));
                }catch(e){
                    obj[hash[0]] = _.escape(hash[1]);
                }
            }
            NAPP['URL_TMP'][current_url] = obj;
            return NAPP['URL_TMP'][current_url][name]||null;
		},
		checkUA:function(){

			if(this.getQueryString("src") == "360around"){
				return "a";
			}else{
				var ua = window.navigator.userAgent;

				var t = "b";

				for(var i in uas){
					if(ua.indexOf(i)!= -1){
						t = uas[i];

						break;
					}
				}

				if(t == "a"){
					var tmp = ua.toLowerCase();
					if (/iphone|ipad|ipod/.test(tmp)) {
						t = 'a_ios';
					} else if (/android/.test(tmp)) {
						t= 'a';
					}
				}
				return t;
			}
		},
		unitChange:function(u){
			if(!u)return false;
			if(u >= 1000){
				u /= 1000;
				u = parseInt(u * 100);
				return u/100+"km";
			}else{
				u = parseInt(u * 100);
				return u/100+"m";
			}
		},
		getQT : function(p,id,cb,src){
			// src = src || '';
			// var p = p.sort(),rp = "",
			// sk = '&sk=b69ed2538337afa80dbb10e71814b152';

			// rp = (p.length > 1)?p.join('&')+sk:p[0]+sk;
			// var sn = hex_md5_fix(rp);

			// var me = this;

			// $.ajax({
	  //           type:"GET",dataType:"jsonp",
	  //           url: me.service_url+"/order/getQtoken?"+p.join("&")+"&sn="+sn+"&src=" + src,
	  //           jsonp:"callback",
	  //           cache:"false",
	  //           success:function(data){
	  //                 if(!data.errno){
			// 	      	cb(data.data);
			// 	      }else{
			// 	      	alert('QToken获取失败');
			// 	      }
	  //           },
	  //           error:function(){
	  //               alert('接口故障');
	  //               window.history.back();
	  //           }
	  //       });
	        cb("");
		},
		compareVersion: function(version){
            if(!version){
                return false;
            }
            //强制转为字符串
            version = version + '';

            var versions = version.split('.'),
                num = 0;

            for(var i=0,l=versions.length;i<l;i++){
                num += versions[i] * Math.pow(10,l-i);
            }

            return num;
        },
        connectWebViewJavascriptBridge : function(callback){
        	var cbk = function(){
            if(!window.iosMsoAppBridgeInit){
                window.iosMsoAppBridgeInit = 1;

                try{
                    WebViewJavascriptBridge.init(function(message, responseCallback) {
                        if (responseCallback) {
                            responseCallback("Right back atcha")
                        }
                    });
                }catch(e){
                }
            }
            WebViewJavascriptBridge.send('NeedLocation', callback);
	        }
	        if (window.WebViewJavascriptBridge) {
	            cbk();
	        } else {
	            document.addEventListener('WebViewJavascriptBridgeReady', function() {
	                cbk();
	            }, false)
	        }
        },
		getCC : function(cb,onlyxy,fail){
			if(!cb)return;

			var cc = 110000,c_n = "北京市";
			var lat , lon;

			var refresh = false;

			this.showLoading(1);

			if($.cookie('__shenbian_lat') && $.cookie('__shenbian_lon')){
				lat = $.cookie('__shenbian_lat');
				lon = $.cookie('__shenbian_lon');
				refresh = true;
				service();
			}

			function service(){
				$.ajax({
		            type:"GET",dataType:"jsonp",
		            url: "//restapi.map.so.com/api/simple?sid=7001&x="+lon+"&y="+lat,
		            jsonp:"callback",
		            success:function(data){

		            	if(onlyxy){
		            		data.lat = lat;
		            		data.lon = lon;
		            	}

		                cb(data);
		            },
		            error:function(){
		                alert('位置服务接口故障');
		            }
		        });
			}

			var me = this;

			if(ISIPHONE && MSOAPP && me.compareVersion && me.compareVersion(MSOAPP) >= me.compareVersion("9999.1.5.0")){
				me.connectWebViewJavascriptBridge(function(responseData){
	                var position = JSON.parse(responseData);
	                lat = position.y;
	                lon = position.x;

	                if(lat != $.cookie('__shenbian_lat')||lon != $.cookie('__shenbian_lon')){
		            	$.cookie('__shenbian_lat',lat,{expires:365,path:'/',domain: 'so.com',secure: false,raw:false});
			            $.cookie('__shenbian_lon',lon,{expires:365,path:'/',domain: 'so.com',secure: false,raw:false});
			            if(!refresh){
			            	service();
			            }
		            }
	            });
	            return;
			}

			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function (position) {
		            lat = position.coords.latitude;
		            lon = position.coords.longitude;

		            if(lat != $.cookie('__shenbian_lat')||lon != $.cookie('__shenbian_lon')){
		            	$.cookie('__shenbian_lat',lat,{expires:365,path:'/',domain: 'so.com',secure: false,raw:false});
			            $.cookie('__shenbian_lon',lon,{expires:365,path:'/',domain: 'so.com',secure: false,raw:false});
			            if(!refresh){
			            	service();
			            }
		            }
		        },function (error) {me.tip('定位失败');fail&&fail();},{ timeout: 5000, enableHighAccuracy: true });
			}else{
				me.tip('定位失败');
				fail&&fail();
			}
		},
		needAddQT : function(pid, custom_url, callback){
			var tmp1 = this.tid_map[pid]['us'][1],me = this;
			if(this.tid_map[pid]['cc']){
      	this.getCC(function(data){
      		me.showLoading(0);
      		var cc = String(data.adcode)||'110000',
      		    p = ['pid='+pid,'ufrom=c'],url = "";
      		if(pid == '22'){
      			if(cc.indexOf('310')>-1&&cc.indexOf('310') == 0){
			    		cc = 310000;
			    	}else{
			    		cc = 110000;
			    	}
            }
	        if(me.tid_map[pid]['cname']){
	    		cc = data.city_name;
	    	}
          var tmp2 = me.tid_map[pid]['us'][2];
            	me.tid_map[pid]['us'][2]+=cc;
	            me.getQT(p,pid,function(qt){
					me.tid_map[pid]['us'][1]+=qt;
	      			for(var i = 0; i < me.tid_map[pid]['us'].length;i++){
	      				url += me.tid_map[pid]['us'][i];
	      			}
	      			me.tid_map[pid]['us'][1] = tmp1;
	      			me.tid_map[pid]['us'][2] = tmp2;

	      			if(custom_url){
	      				(custom_url.indexOf('?')>-1)?url = custom_url+"&qtoken="+qt:url = custom_url+"?qtoken="+qt;
	      			}
					if( callback && typeof callback === 'function' ) return callback(qt, cc);
	      			window.location.href = url;
      		});
        },null,function(){
				me.showLoading(0);
	      		var cc = '110000',p = ['pid='+pid,'ufrom=c'],url = "";
	      		if(me.tid_map[pid]['cname']){
	      			cc = '北京市';
	      		}
	            var tmp2 = me.tid_map[pid]['us'][2];
	            me.tid_map[pid]['us'][2]+=cc;
	            me.getQT(p,pid,function(qt){
      			me.tid_map[pid]['us'][1]+=qt;
      			for(var i = 0; i < me.tid_map[pid]['us'].length;i++){
      				url += me.tid_map[pid]['us'][i];
      			}
      			me.tid_map[pid]['us'][1] = tmp1;
      			me.tid_map[pid]['us'][2] = tmp2;
      			if(custom_url){
      				(custom_url.indexOf('?')>-1)?url = custom_url+"&qtoken="+qt:url = custom_url+"?qtoken="+qt;
      			}
			    if( callback && typeof callback === 'function' ) return callback(qt, cc);
      			window.location.href = url;
      		});
      	});
      }else{
	      	var p = ['pid='+pid,'ufrom=c'],url = "";
	      	me.getQT(p,pid,function(qt){
	  			me.tid_map[pid]['us'][1]+=qt;
	  			for(var i = 0; i < me.tid_map[pid]['us'].length;i++){
	  				url += me.tid_map[pid]['us'][i];
	  			}
	  			me.tid_map[pid]['us'][1] = tmp1;
	  			if(custom_url){
	  				(custom_url.indexOf('?')>-1)?url = custom_url+"&qtoken="+qt:url = custom_url+"?qtoken="+qt;
	  			}
				if( callback && typeof callback === 'function' ) return callback(qt);
	  			window.location.href = url;
	  		});
	      }
		},
		sfl_map:{
			remenfuwu : {
				label : '热门服务',
				sub:[{
					label:'流量充值',
					label_en:'shoujichongzhi',
					url:'http://360.app10088.com/traf-sale/c/YF7V7v'
				},{
					label : '查违章',
					label_en : 'chaweizhang',
					url : '/orders/#scene=service_weizhang'
				},{
					label:'滴滴打车',
					label_en:'dididache',
					url:'http://common.diditaxi.com.cn/general/webEntry?channel=55115&d=130002030203&maptype=soso'
				},
				// {
				// 	label:'夜宵',
				// 	label_en:'yexiao',
				// 	url:'/orders/#scene=service_yexiao'
				// },
				{
					label:'ETCP停车',
					label_en:'etcptingche',
					url:'http://dsf.etcp.cn/qihoo/login'
				},
				{
					label : '按摩',
					label_en : 'anmo',
					url : '/orders/#scene=shangmen_anmo'
				},{
					label:'查快递',
					label_en:'chakuaidi',
					url:'http://m.kuaidi100.com/haosou/'
				}]
			},
			chaxunjiaofei : {
				label:'查询缴费',
				sub:[{
					label:'Q币点卡',
					label_en:'qbidianka',
					url:'http://360.m.7881.com/home.html?from=lifeapp'
				},{
					label:'查快递',
					label_en:'chakuaidi',
					url:'http://m.kuaidi100.com/haosou/'
				},{
					label:'流量充值',
					label_en:'shoujichongzhi',
					url:'http://360.app10088.com/traf-sale/c/YF7V7v'
				}]
			},
			waimai:{
				label:'外卖',
				sub:[{
					label:'美食外卖',
					label_en:'meishiwaimai',
					url:'http://i.waimai.meituan.com/#360map'
				},{
					label:'夜宵',
					label_en:'yexiao',
					url:'/orders/#scene=service_yexiao'
				},{
					label:'新鲜美食',
					label_en:'xinxianmeishi',
					url:'/orders/#scene=shangmen_fruit'
				},{
					label:'节日礼品',
					label_en:'jierilipin',
					url:'/orders/#scene=shangmen_lipin'
				}]
			},
			chuxing : {
				label:'出行',
				sub:[{
					label:'滴滴打车',
					label_en:'dididache',
					url:'http://common.diditaxi.com.cn/general/webEntry?channel=55115&d=130002030203&maptype=soso'
				},{
					label:'火车票',
					label_en:'huochepiao',
					url:'http://m.tieyou.com/jy/index.php?param=default/home.html&utm_source=360haosou'
				},{
					label:'代驾',
					label_en:'daijia',
					url:'/orders/#scene=shangmen_drive'
				}]
			},
			zufang : {
				label : '租房',
				sub:[{
					label:'租房',
					label_en:'zufang',
					url:'/orders/#scene=service_zufang'
				}]
			},
			yiliao : {
				label: '医疗',
				sub:[/*{
					label : '送药上门',
					label_en : 'songyaoshangmen',
					url:'/orders/#scene=shangmen_medicine'
				},*/{
					label : '挂号',
					label_en : 'guahao',
					url:'/orders/#scene=shangmen_guahao'
				},{
					label : '问医',
					label_en : 'wenyi',
					url : 'http://360.platform.haodf.com/'
				}/*,{
					label : '找牙医',
					label_en : 'zhaoyayi',
					url : 'http://yueya.kuaixiang.com/shenbian.do'
				}*/]
			},
			jujiabangshou : {
				label : '居家帮手',
				sub:[
				{
					label:'搬家',
					label_en : 'banjiafuwu',
					url : '/orders/#scene=shangmen_banjia'
				},
				{
					label:'家政保洁',
					label_en : 'banjiabaojie',
					url : '/orders/#scene=shangmen_fuwu'
				},{
					label : '大厨上门',
					label_en :'dachushangmen',
					url : 'http://www.idachu.cn/?ichannel=990'
				},{
					label : '二手物品',
					label_en : 'ershouwupin',
					url : 'http://jump.luna.58.com/i/26ux'
				},{
					label : '洗衣洗鞋',
					label_en : "xiyixixie",
					url :　"/orders/#scene=shangmen_xiyixixie"
				}]
			},
			yangsheng : {
				label : '美容按摩',
				sub:[{
					label : '按摩',
					label_en : 'anmo',
					url : '/orders/#scene=shangmen_anmo'
				},{
					label : '美容保养',
					label_en : 'meirongbaoyang',
					url : '/orders/#scene=shangmen_beauty'
				},{
					label : '美甲',
					label_en : 'meijia',
					url : 'http://t.jzt.58.com/wap/meijia/products?hmsr=360&comm_pf=0&comm_flag=0'
				}]
			},
			qiche : {
				label : '汽车',
				sub : [{
					label : '洗车',
					label_en : 'guaguaxiche',
					url : 'http://m.guaguaxiche.com/client/order.html'
				},{
					label : '汽车保养',
					label_en : 'qichebaoyang',
					url : '/orders/#scene=shangmen_car'
				},{
					label : '查违章',
					label_en : 'chaweizhang',
					url : '/orders/#scene=service_weizhang'
				},{
					label : '二手车',
					label_en : 'ershouche',
					url : 'http://m.guazi.com/misc/cooperation/?source=haosou'
				},{
					label : '汽车陪练',
					label_en : 'qichepeilian',
					url : '/#peilian/index/'
				},{
					label : '新车询价',
					label_en : 'xinchexunjia',
					url : 'http://price.m.yiche.com/?s=85534AEB-E0FB-4193-BD5B-3EA1808C7E6E&WT.mc_id=m360sbapp'
				},{
					label : '摇号查询',
					label_en : 'yaohaochaxun',
					url : 'http://cha.weiche.me/roll.php?channel=360'
				}]
			},//
			jinrongfuwu : {
				label : '金融服务',
				sub : [{
					label : '在线办卡',
					label_en : 'daikuanbanka',
					url : '/orders/#scene=service_money'
				},{
					label : '在线贷款',
					label_en : 'zaixiandaikuan',
					url : '/orders/#scene=service_daikuan'
				}]
			},
			chongwu : {
				label : '宠物',
				sub : [{
					label : '宠物交易',
					label_en : 'chongwujiaoyi',
					url : 'http://jump.luna.58.com/i/26uw'
				}/*,{
					label : '宠物养护',
					label_en : 'chongwuyanghu',
					url : '/orders/#scene=shangmen_chongwu'
				}*/]
			},
			qiuzhi : {
				label : '求职',
				sub:[{
					label : '找工作',
					label_en : 'zhaogongzuo',
					url : 'http://www.doumi.com/h5#/index?from=360haosou_bd_01'
				}]
			},
			dianqiweixiu : {
				label : '电器维修',
				sub:[{
					label : '电器维修',
					label_en : 'dianqiweixiu',
					url : '/orders/#scene=shangmen_fix'
				}]
			},
			jiaoyu : {
				label : '教育',
				sub : [{
					label : '找老师',
					label_en : 'zhaolaoshi',
					url : '/orders/#scene=shangmen_teacher'
				}]
			},
			hunqing : {
				label : '婚庆',
				sub : [{
					label : '婚庆策划',
					label_en : 'hunqingcehua',
					url : 'http://m.daoxila.com/?app=dxl&utm_source=BD&utm_medium=HaoSou&utm_term=20151019'
				},{
					label : '摄影写真',
					label_en : 'sheyingxiezhen',
					url:'/orders/#scene=service_camera'
				}]
			}
		},
		tid_map:{
				"weiche":{
			    	n:'微车',
			    	type:'service_weizhang',
			    	sub:{
						't':'违章查询',
						'p':'免费查违章',
						'u':'http://cha.weiche.me/360web',
						'd_p':'service_weizhang',
						'd_d':'weiche'
					}
			    },
			    "chexingyi":{
			    	n:'车行易',
			    	type:'service_weizhang',
			    	sub:{
						't':'违章查询、代缴',
						'p':'部分代缴免服务费',
						'u':'http://banli.cx580.com/QuickQuery/Default.aspx?userType=360kuaisou2016',
						'd_p':'service_weizhang',
						'd_d':'chexingyi'
					}
			    },
			    "ganjikuaizhao":{
			    	n:'赶集快招',
			    	type:'service_gongzuo',
			    	sub:{
						't':'蓝领招聘、企业直聘',
						'p':'免费服务',
						'u':'http://k.ganji.com/bj/?from=tg_haosou',
						'd_p':'service_gongzuo',
						'd_d':'ganjikuaizhao'
					}
			    },
				"huolala":{
					n:"货拉拉",
					type:"shangmen_banjia",
					sub:{
						't':'安心拉货、轻松搬家，拉货就找货拉拉',
						'p':'根据服务车型、距离定价',
						'u':'http://m.webapp.huolala.cn/',
						'd_p':'service_banjia',
						'd_d':'huolala'
					}
				},
			    "doumijianzhi":{
			    	n:'斗米兼职',
			    	type:"service_gongzuo",
			    	sub:{
						't':'找兼职、高薪急聘',
						'p':'免费服务',
						'u':'http://www.doumi.com/h5#/index?from=360haosou_bd_01',
						'd_p':'service_gongzuo',
						'd_d':'doumijianzhi'
					}
			    },
			    "ganjihaozu":{
			    	n:'赶集好租',
			    	type:"service_zufang",
			    	sub:{
						't':"写字楼、办公楼租赁",
						'p':"根据具体服务内容定价",
						'u':'http://m.haozu.com/?ca_s=tg_360&ca_n=shenbian_haozu',
						'd_p':'service_zufang',
						'd_d':'ganjihaozu'
					}
			    },
				"58zufang":{
					n:'58租房',
					type:"service_zufang",
					sub:{
						't':"租房，新房，二手房，合租",
						'p':'根据具体服务内容定价',
						'u':'http://jump.luna.58.com/s?spm=s-32483932476171-ms-f-806&ch=m-fangchan',
						'd_p':'service_zufang',
						'd_d':'58zufang'
					}
				},
			  //   "ganjiyixiche":{
			  //   	n:"赶集易洗车",
			  //   	type:'shangmen_car',
			  //   	sub:{
					// 	't':'清洗外观、清洗内饰、打蜡、去除虫胶',
					// 	'p':'25元-153元',
					// 	'u':'http://sta.ganji.com/ng/app/client/common/index.html?ca_s=360s&businessCode=360s#app/client/app/xiche/pub_page/view/index.js',
					// 	'd_p':'service_xiche',
					// 	'd_d':'ganjixiche'
					// }
			  //   },
			    "dididache":{
			    	n:'滴滴打车',
			    	type:'shangmen_dache',
			    	sub:{
						't':'支持全国300多个城市在线叫车',
						'p':'按车内计价器显示金额付费',
						'u':'http://webapp.diditaxi.com.cn/?channel=55115&d=130002030203&maptype=soso',
						'd_p':'service_daijia',
						'd_d':'dididache'
					}
			    },
			    "tongchengbang":{
			    	n:'同城帮',
			    	type:'shangmen_fix',
			    	sub:{
						't':'修手机、修电脑、修iPad、数据恢复',
						'p':'根据具体服务内容定价',
						'u':'http://m.bang.360.cn/ziying?from=map&appShowTitle=false',
						'd_p':'service_weixiu',
						'd_d':'tongchengbang'
					}
			    },
			    "58daojia":{
			    	n:'58到家',
			    	type:'shangmen_beauty',
			    	sub:{
						't':'专业美甲上门服务',
						'p':'59元-88元起',
						'u':'http://t.jzt.58.com/wap/meijia/products?hmsr=360&comm_pf=0&comm_flag=0',
						'd_p':'service_meirong',
						'd_d':'58daojia'
					}
			    },
			    "rong360_1":{
			    	n:"融360",
			    	type:"service_money",
			    	sub:{
			    		't':'帮您推荐信用卡',
			    		'p':'免费服务',
			    		'u':'http://m.rong360.com/credit/card/landing/2?utm_source=360haosoush&utm_medium=360hssh_xyk',
			    		'd_p':'service_money',
			    		'd_d':'xinyongka'
			    	}
			    },
			    "rong360_2":{
			    	n:"融360",
			    	type:"service_daikuan",
			    	sub:{
			    		't':'小额贷款,最快10分钟审批',
			    		'p':'视项目而定',
			    		'u':'http://m.rong360.com/express/?from=sem7&utm_source=360haosoush&utm_medium=360hssh_dk',
			    		'd_p':'service_money',
			    		'd_d':'daikuan'
			    	}
			    },
			    "haodaiwang_2":{
			    	n:"好贷网",
			    	type:"service_daikuan",
			    	sub:{
			    		't':'免费贷款,一对一服务',
			    		'p':'免费服务',
			    		'u':'http://8.yun.haodai.com/Mobile/?ref=hd_1101794',
			    		'd_p':'service_money',
			    		'd_d':'haodaiwang_daikuan'
			    	}
			    },
			    "haodaiwang_1":{
			    	n:"好贷网",
			    	type:"service_money",
			    	sub:{
			    		't':'免费信用卡申请，在线批卡',
			    		'p':'免费服务',
			    		'u':'http://8.yun.haodai.com/Mobile/creditcard/?ref=hd_1101794',
			    		'd_p':'service_money',
			    		'd_d':'haodaiwang_banka'
			    	}
			    },
			    "edaixi":{
			    	n:'e袋洗',
			    	type:"shangmen_xiyixixie",
			    	sub:{
						't':'洗衣就用e袋洗，幸福生活每一天',
						'p':'洗衣9元起，洗鞋19元起',
						'u':'http://wx.rongchain.com/mobile.php?m=wap',
						'd_p':'service_jiazheng',
						'd_d':'edaixi'
					}
			    },
			  //   "aidachu":{
			  //   	n:'爱大厨',
			  //   	type:"shangmen_fuwu",
			  //   	sub:{
					// 	't':'星级厨师上门做饭',
					// 	'p':'69元起',
					// 	'u':'http://www.idachu.cn/?ichannel=990',
					// 	'd_p':'service_jiazheng',
					// 	'd_d':'aidachu'
					// }
			  // },
			    // "gensheixue":{
			    // 	n:"跟谁学",
			    // 	type:"shangmen_teacher",
			    // 	sub:{
			    // 		't':'快速找到周围好老师',
			    // 		'p':'根据具体服务内容定价',
			    // 		'u':'http://m.genshuixue.com/st/-.html?source=gsx_360shenbian_msite',
			    // 		'd_p':'service_teacher',
			    // 		'd_d':'gensheixue'
			    // 	}
			    // },
				"15":{
					n:"小美到家",
					us:["http://weixin.beauty.xiaolinxiaoli.com/app/wx?","qtoken=","&citycode="],
					cc:1,
					type:'shangmen_beauty',
					sub:{
						't':'法国皇家级SPA护理',
						'p':'110元起',
						'u':0,
						'd_p':'service_meirong',
						'd_d':'xiaomeidaojia'
					}
				},
				// "22":{
				// 	n:"美丽来",
				// 	us:["http://m.meililai.com/meililai/360/projectlist.html?channel=10014","&qtoken=","&citycode="],
				// 	cc:1,
				// 	type:'shangmen_beauty',
				// 	sub:{
				// 		't':'面部保湿、美白、抗衰、全身经络疏通等',
				// 		'p':'58元-598元',
				// 		'u':0,
				// 		'd_p':'service_meirong',
				// 		'd_d':'meililai'
				// 	}
				// },
				"28":{
					n:"美到家",
					us:["http://api.meidaojia.com/mapi/port/shb360/index","?qtoken=","&city_name="],
					cc:1,
					cname:1,
					type:'shangmen_beauty',
					sub:{
						't':'9大妆容选择，专业美妆师上门服务',
						'p':'168元起',
						'u':0,
						'd_p':'service_meirong',
						'd_d':'meidaojia'
					}
				},
				"25":{
					n:"药给力",
					us:["http://medicinepower.cn/web_client/haosou","?qtoken=","&city_name=","#/tab/categories"],
					cc:1,
					cname:1,
					type:"shangmen_medicine",
					sub:{
						't':'1小时送药上门',
						'p':'免费配送',
						'u':0,
						'd_p':'service_songyao',
						'd_d':'yaogeili'
					}
				},
				"21":{
					n:"就医160",
					us:["http://h5.91160.com/index.php?c=unit&a=index&from=360-haosou","&qtoken=","&city_name="],
					cc:1,
					cname:1,
					type:"shangmen_guahao",
					sub:{
						't':'医院预约挂号',
						'p':'免费预约',
						'u':0,
						'd_p':'service_songyao',
						'd_d':'jiuyi160'
					}
				},
				// "23":{
				// 	n:"赶集家政",
				// 	us:["http://sta.ganji.com/ng/app/client/common/index.html?ca_s=tg_360&ca_n=shenbianbd_jiazheng&ca_i=user_id_token&redirect=true","&ca_kw=","#app/fuwu/client/cleaning/view/customer/index.js?city=bj"],
				// 	cc:0,
				// 	type:'shangmen_fuwu',
				// 	sub:{
				// 		't':'家庭保洁、新居开荒、深度保洁',
				// 		'p':'家庭保洁30元/小时；深度保洁4元/平米；开荒保洁5元/平米',
				// 		'u':0,
				// 		'd_p':'service_jiazheng',
				// 		'd_d':'ganjijiazheng'
				// 	}
				// },
				// "24":{
				// 	n:"赶集维修",
				// 	us:["http://sta.ganji.com/ng/app/client/common/index.html?ca_s=tg_360&ca_n=shenbianbd_weixiu&ca_i=user_id_token&redirect=true","&ca_kw=","#app/fuwu/client/repair/view/customer/index.js?city=bj"],
				// 	cc:0,
				// 	type:"shangmen_fix",
				// 	sub:{
				// 		't':'空调、电视、油烟机等家用电器上门维修',
				// 		'p':'根据具体服务内容定价',
				// 		'u':0,
				// 		'd_p':'service_weixiu',
				// 		'd_d':'gangjiweixiu'
				// 	}
				// },
				"10":{
					n:"微代驾",
					us:["http://m.weidaijia.cn/mx/?source=360","&qtoken="],
					cc:0,
					type:'shangmen_drive',
					sub:{
						't':'酒后代驾、商务代驾、长途代驾',
						'p':'39元-300元',
						'u':0,
						'd_p':'service_daijia',
						'd_d':'weidaijia'
					}
				},
				"16":{
					n:"点到",
					us:["http://360life.diandao.org/api/QihuShenBian/selCity?utm_source=disanfang&utm_medium=360_haosou","&qtoken=","&city_name="],
					cc:1,
					cname:1,
					type:'shangmen_anmo',
					sub:{
						't':'全身理疗、腰腿理疗、头颈肩理疗',
						'p':'128元-158元',
						'u':0,
						'd_p':'service_anmo',
						'd_d':'diandao'
					}
				},
				"14":{
					n:"狗狗去哪",
					us:["http://www.dogwhere.com:8080/pet/newOrder/openBath.html?source=360z","&qtoken="],
					cc:0
				},
				"18":{
					n:"生日管家",
					us:["http://m.shengri.cn/~qh_hs/","?qtoken="],
					cc:0,
					type:"shangmen_lipin",
					sub:{
						't' : '礼品、鲜花、蛋糕预定',
						'p' : '根据不同礼品定价',
						'u' : 0,
						'd_p' : 'shangmen_lipin',
						'd_d' : 'shengriguanjia'
					}
				},
				// "13":{
				// 	n:"赶集搬家",
				// 	us:["http://sta.ganji.com/ng/app/client/common/index.html?ca_s=tg_360&ca_n=shenbianbd_banjia&ca_i=1","&ca_kw=","#app/fuwu/client/banjia/view/customer/index_page.js?city=bj&citycode=320100"],
				// 	cc:0,
				// 	type:"shangmen_banjia",
				// 	sub:{
				// 		't':'放心搬家服务',
				// 		'p':'120元起',
				// 		'u':0,
				// 		'd_p':'service_banjia',
				// 		'd_d':'ganjibanjia'
				// 	}
				// },
				"30":{//特殊的，网页直接跳自己的页面，但是有tid 和qtoken
					n:"58汽车陪练",
					us:[],
					cc:0,
					type:'',
					sub:{
						't':'汽车陪练，驾考项目强化练习',
						'p':'69元-99元',
						'u':'//m.map.so.com/#peilian/index/',
						'd_p':'service_daijia',
						'd_d':'58peilian'
					}
				},
				"19":{
					n:"功夫熊",
					us:["http://w.gfxiong.com/search360/lst/product","?qtoken=","&city_name="],
					cc:1,
					cname:1
				},
				"32":{
					n:"摩卡i车",
					us:["http://app.mocar.cn/microsite/index.html?ch=109&_int=all-services","&qtoken=","&city_name="],
					cc:1,
					cname:1,
					type:"shangmen_car",
					sub:{
						't':'专业汽车养护、维修上门服务',
						'p':'99元起',
						'u':0,
						'd_p':'service_xiche',
						'd_d':'mokaiche'
					}
				},
				"33":{
					n:"爱鲜蜂",
					us:["http://m.beequick.cn/?tn=360shenghuo","&qtoken="],
					cc:0,
					type:"shangmen_fruit",
					sub:{
						't':'生鲜水果，即刻送达',
						'p':'0元起送，满30免运费',
						'u':0,
						'd_p':'shangmen_fruit',
						'd_d':'aixianfeng'
					}
				},
				// "38":{
				// 	n:"摸摸哒",
				// 	us:["http://360hs.momoday.net/360hs.php","?qtoken="],
				// 	cc:0,
				// 	type:"shangmen_chongwu",
				// 	sub:{
				// 		't':'宠物洗澡、美容、训练、体检',
				// 		'p':'根据具体服务内容定价',
				// 		'u':0,
				// 		'd_p':'service_chongwu',
				// 		'd_d':'momoda'
				// 	}
				// },
				"40":{
					n:"哪拍",
					us:["http://wap.napai.cn/auto_city/sheying","?qtoken="],
					cc:0,
					type:"service_camera",
					sub:{
						't':"预约本地婚纱影楼、摄影师",
						'p':"最低1折起",
						'u':0,
						'd_p':'service_camera',
						'd_d':'napai'
					}
				},
				"45":{
					n:"拼豆夜宵",
					us:["http://h5.snacks.pindou.com/ch/360","?qtoken=","&citycode="],
					cc:1,
					type:"service_yexiao",
					sub:{
						't':"深夜美食，夜宵专卖",
						'p':"80元起送",
						'u':0,
						'd_p':'service_yexiao',
						'd_d':'pindouyexiao'
					}
				},
				"44":{
					n:"蚂蚁短租",
					us:["http://m.mayi.com?ca_s=tg_360&ca_n=shenbian_mayi","&qtoken="],
					cc:0,
					type:"service_zufang",
					sub:{
						't':"旅游住宿、家庭旅馆、短租公寓",
						'p':"根据具体服务内容定价",
						'u':0,
						'd_p':'service_zufang',
						'd_d':'mayiduanzu'
					}
				},
				"50":{
				    n:"点妙手",
					us:["http://www.dianmiaoshou.com/micro","?qtoken=","&city_name="],
					cc:1,
					cname:1,
					type:'shangmen_anmo',
					sub:{
						't':'全身推拿，局部推拿，V体验',
						'p':'128元-588元',
						'u':0,
						'd_p':'service_anmo',
						'd_d':'dianmiaoshou'
					}
				},
				"51":{
					n:"萌管家",
					us:["http://wx.meguanjia.com/web/resvmain.html","?qtoken="],
					cc:0,
					type:"shangmen_chongwu",
					sub:{
						't':'全犬型经典洗护、美容服务',
						'p':'根据具体服务内容定价',
						'u':0,
						'd_p':'service_chongwu',
						'd_d':'mengguanjia'
					}
				},
				"52":{
					n:"e家帮",
					us:["http://www.ejbang.com/360shzs/tohsindexpage.do?key=360hs","&qtoken="],
					cc:0,
					type:'shangmen_fuwu',
					sub:{
						't':'日常保洁、大扫除等日常性家政服务',
						'p':'25-30元每小时，2小时起约',
						'u':0,
						'd_p':'service_jiazheng',
						'd_d':'ejiabang'
					}
				},
				// "54":{
				//  	n:"白鹭美",
				//  	us:["http://m.bailumei.com/index.php/channel/360","?qtoken=","&city_name="],
				//  	cc:1,
				//  	cname:1,
				//  	type:'shangmen_beauty',
				//  	sub:{
				//  		't':'女性上门美容优选品牌',
				//  		'p':'￥49起',
				//  		'u':0,
				//  		'd_p':'service_meirong',
				//  		'd_d':'bailumei'
				//  	}
				// },
				 "53":{
				 	n:"极客修",
				 	us:["http://m.jikexiu.com/zhida/?orderSource=90","&qtoken="],
				 	cc:0,
				 	type:"shangmen_fix",
				 	sub:{
				 		't':"苹果、小米、华为等手机平板维修",
				 		'p':"视具体故障而定",
				 		'u':0,
				 		'd_p':'service_weixiu',
				 		'd_d':'jikexiu'
				 	}
				 },
				 "56":{
				 	n:"必有我师",
				 	us:["http://partys.5teacher.com/partys/auth/jobteacher/?fromid=sbsh&token=&userid=&phone=&footerindex=0","&qtoken="],
				 	cc:0,
				 	type:"shangmen_teacher",
				 	sub:{
				 		't':'找到最合适自己的老师',
				 		'p':'根据具体服务内容定价',
				 		'u':0,
				 		'd_p':'service_teacher',
				 		'd_d':'biyouwoshi'
				 	}
				 },
				 "57":{
				 	n:"典典养车",
				 	us:["http://h5.yangchediandian.com/index.php?appid=xk55xg76cy4p8ygsg8","&qtoken="],
				 	cc:0,
				 	type:"shangmen_car",
				 	sub:{
				 		't':"洗车、加油、车险、保养美容等",
				 		'p':"10元起",
				 		'u':0,
				 		'd_p':'service_xiche',
				 		'd_d':'diandianyangche'
				 	}
				 }
		}
	}
});
