define(function(require) {
	var config = require('js/app/conf/config');
    var monitor = require('js/app/monitor').search;

    function Suggest(options){
		options = options || {};
		this.url = options.url;
		this.element = options.element;
		this.container = options.container || document.body; //默认插在body底部
		this.renderSuggest = options.renderSuggest || this._renderSuggest; //自定义模板
		this.callback = options.callback || '';//点击后的回调
		this.save_history = options.save_history || false; //是否对搜索词进行本次存储;
		this.storage_key = options.storage_key || config.STORAGE_KEYS.POIHISTORY; //本地存储localStorage的key
		this.dialog = null;
		this.query = null; /*当前显示的query*/
		this.suggestData = null; /*显示的suggest数据*/
		this.historyData = null; /*显示的history数据*/
		this.selected_index = -1; /*当前选中的数据*/
		this.child_index = -1; /*点击的是否是子点*/
		this.cacheData = {}; /*缓存数据*/
		this.isHistory = false; /*当前显示的是否是历史记录，显示历史记录时input获得失去焦点时不隐藏*/
		this.tpl = {
            'suggest_con':require('../../templates/new_suggest_con.html'),
            'suggest_item': require('../../templates/new_suggest_item.html'),
            'history_item': require('../../templates/new_history_item.html')
        };
		if(typeof this.element === 'string'){
			this.element = $(this.element);
		}

		if(typeof this.container === 'string'){
			this.container = $(this.container);
		}

		if(this.save_history && !this.storage_key){
			throw new Error('要进行本地存储，必须指定 storage_key ！');
		}


		this.init();
	}

	Suggest.prototype = {
		init: function(){
			this.initDialog();
			this.bind();
		},
		bind: function(){
			var me = this;
			var parent_node = this.element.parent();

			//focus、blur 事件目前看没有什么用，暂时屏蔽掉，有问题后再处理
			// this.element.on('focus', function(){
			// 	var input = $(this);
			// 	var val = $.trim(input.val());

			// 	if(val){
			// 		me.getSuggest(val);
			// 	}
			// });

			// this.element.on('blur', function(){
			// 	//当显示的是历史记录时不触发该事件
			// 	if(me.isHistory){
			// 		return false;
			// 	}

			// 	me.hideDialog();
			// });

			this.element.on('input', function(){
				var input = $(this);
				var val = $.trim(input.val());

				me.element.data('pos_x', '');
				me.element.data('pos_y', '');

				if(val){
					parent_node.addClass('show_clear_btn');
					me.getSuggest(val);
				}else{
					parent_node.removeClass('show_clear_btn');

					//无搜索词的时候显示历史记录;
					if(me.save_history){
						me.showHistory();
					}else{
						me.hideDialog();
					}
				}
			});

			this.element.on('keydown', function(event){
				var keyCode = event.keyCode; /* 40:down  38:up  13:enter*/
				var keyInfo = {
					"13": "enter",
					"38": "up",
					"40": "down"
				};
				var input = $(this);
				var type = keyInfo[keyCode];
				var viewData = me.getViewData();
				var length = viewData && viewData.length;
				var index = me.selected_index;
				var input_val = $.trim(input.val());

				/*回车直接返回*/
				if(type == 'enter'){					
					me.hideDialog();

					if(input_val && me.callback){
						me.callback(input_val);
					}

					return false;
				}

				if(type){
					if(type == 'down'){
						index += 1;
					}else{
						index -= 1;
					}

					if(index < 0){
						index += length+1;
					}

					if(index > length){
						index = 0;
					}

					me.dialog.trigger('list:select', {
						'selected_index':index,
						'only_select' : 1
					});
				}

			});

			this.element.on('input:valued', function(eve, opts){
				var viewData = me.getViewData();
				var selected = viewData[me.selected_index] || {name: me.query};
				var selected_val = selected.name;

				me.element.val(selected_val);

				// me.element.prev().hide();
    			// me.element.focus();


                //ios9下input focus后页面不往上滚动
                window.scrollTo(0,0);

                // me.element.focus();
                me.element.trigger('input');
			});

			this.element.on('input:selected', function(eve, opts){
				opts = opts || {};

				var params = So.State.currentUI.view_data.params;
                var _mp = params.mp && params.mp.split(",");
                var _city = params.city;
                var city = So.State.getLocation();
                if(_mp && _mp[0] && _mp[1]){
                    city = {
                        city: _city,
                        x: _mp[1],
                        y: _mp[0]
                    }
                }

                var viewData = me.getViewData();
				var selected = viewData[me.selected_index] || {name: me.query};
				var selected_val = selected.name;
				var only_select = opts.only_select;

				//点击的是子点
				if(me.child_index != -1 && selected.child && selected.child[me.child_index]){
					selected = selected.child[me.child_index];

					//点击子点时name 用主点+子点拼接
					selected_val += selected.name;
				}

				

				me.element.val(selected_val);

				if(only_select){
					return false;
				}


				var monitorFunctionName = me.isHistory ? 'history' : 'sug';
                monitor.click[monitorFunctionName]({
                    query: me.query,
                    keyword: selected_val,
                    index: me.selected_index || "",
                    pguid: selected.pguid || "",
                    cityname: city.city || ""
                });



				if(me.callback){
					me.callback(selected_val, {
						address: selected.address,
						cat_new: selected.cat_new,
                        pguid: selected.pguid,
                        x:selected.x || selected.posx,
                        y:selected.y || selected.posy,
                        userLocation: selected.userLocation
					});
				}
			})
		},
		getOffset: function(){
			var offset = this.element.offset();
			var width = this.element.outerWidth();
			var height = this.element.outerHeight();
			return {
				left: offset.left,
				top: offset.top + height,
				width: width
			};
		},
		getViewData: function(){
			var data = this.historyData;

			if(!this.isHistory){
				data = this.suggestData
			}

			return data;
		},
		getSuggest: function(val){
			var me = this;
			if(!val || me.cacheData[val]){

				me.showSuggest(me.cacheData[val]);

				return false;
			}
			var currentUI = So.State.currentUI;
            var params = So.State.currentUI.view_data.params;
            var _mp = params.mp && params.mp.split(",");
            var _city = params.city;
            var city = {
	                city: _city
	            };
            if(_mp && _mp[0] && _mp[1]){
                city.x = _mp[1];
                city.y = _mp[0];
            }
            So.PoiService.poiHints(val, city, function(data) {
            	var cur_val = $.trim(me.element.val());

				/*如果返回的query跟当前的query不一致则忽略*/
				if(val != cur_val){
					return false;
				}

				data = me.formatData(data);

				/*缓存数据;*/
				me.cacheData[val] = data;

				/*记录当前的query;*/
				me.query = val;

				me.showSuggest(data);
            });
		},
		showSuggest: function(data){
			var me = this;
			data = data || [];

			if(data && data.length){
				//添加用户定位显示;
				var loc = So.State.getLocation(true);
            	var show_location = So.State.currentUI.view_data.params.showlocation == "1";
            	var loc_info = {
	        			userLocation: "1",
	        			name: loc.address,
	        			address: loc.address,
	        			x: loc.x,
	        			y: loc.y
	        		};

            	if(show_location && loc.state == 1){
            		if(data[0].userLocation){
            			data[0] = loc_info;
            		}else{
            			data.unshift(loc_info);
            		}
            	}

				var html = me.renderSuggest(data, {
					query: me.query
				});
				me.dialog.html(html).show();
			}else{
				me.hideDialog();
			}

			/*存储当前显示的数据;*/
			me.suggestData = data;

			me.isHistory = false;
		},
		formatData: function(data){
			data = data || {};
			var arr = [];
			var list = data.poi || [];

			//服务端返回的历史记录中分类是： main_cat_new 
			//suggest接口返回的 分类是：cat_new
			//前端统一为cat_new
			for(var i=0,l=list.length;i<l;i++){
				var item = list[i];
				var obj = {
					name: item.name,
					address: item.address,
					cat_new: item.main_cat_new,
					pguid: item.pguid,
					x: item.x,
					y: item.y
				};

				arr.push(obj);
			}

			return arr;
		},
		showDialog: function(){
			if(!this.dialog){
				this.initDialog();
			}
			this.dialog.show();
		},
		hideDialog: function(opts){
			opts = opts || {};
			var force = opts.force || false;
			if(!force && this.isHistory){
				return false;
			}


			this.dialog.hide();
		},
		initDialog: function(){
			var me = this;
			var offset = me.getOffset();
			this.dialog = $('<div></div>').css({
				// position: 'absolute',
				// border: '#e5e5e5 solid 1px',
				// background: '#fff',
				// left: offset.left,
				// top: offset.top,
				// width: offset.width - 2
			}).appendTo( me.container );

			this.dialog.on('mouseover', 'li', function(){
				var lis = me.dialog.find('li');
				var li = $(this);
				var index = li.index();

				lis.removeClass('active');
				li.addClass('active');

				me.selected_index = index;
			});

			this.dialog.on('mouseout', 'li', function(){
				var lis = me.dialog.find('li');

				lis.removeClass('active');
				me.selected_index = -1;
			});

			this.dialog.on('mousedown', 'li', function(e){
				/*只响应鼠标左键*/
				if(e.which !== 1){
					return false;
				}
				var li = $(this);
				var target = $(e.target);
				var index = li.index();
				var is_child = target.closest('.child');
				var child_index = is_child.length ? target.index() : -1;
				var data_action = target.data('action');
				var is_arrow = target.data('action') == 'arrow';

				//点击的元素有绑定action时执行指定的action;
				if(data_action && me[data_action]){
					me[data_action].call(me, {
						index: index
					});

					return false;
				}


				me.dialog.trigger('list:select', {
					'selected_index': index,
					'child_index': child_index,
					'is_arrow': is_arrow
				});

				me.hideDialog({
					force: true
				});

				return false;
			});

			me.dialog.on('list:select', function(eve, opts){
				opts = opts || {};
				var lis = me.dialog.find('li');
				var selected_index = opts.selected_index;
				var child_index = opts.child_index;
				var is_arrow = opts.is_arrow;

				lis.removeClass('active');
				lis.eq(selected_index).addClass('active');


				/*记录选中的数据索引*/
				me.selected_index = selected_index;

				me.child_index = child_index;

				if(is_arrow){
					me.element.trigger('input:valued', opts);
				}else{
					/*触发选中事件*/
					me.element.trigger('input:selected', opts);
				}
				
			});
		},
		_renderSuggest: function(data){
			var me = this;
            var query = this.query;
            var list = ['<ul class="suggestCon list">'];
            var highlightKey = query.replace('\\', '\\\\').replace('(','\\(').replace(')','\\)');

            _.each(data, function(poi, index) {
                var name = poi.name;

                //排除115类别
                if(poi.child && poi.child.length){
                    _.each(poi.child, function(item, _ind){
                        if(item.cat_new == "115"){
                            poi.child.splice(_ind,1);
                        }
                    });
                }


                var reg = new RegExp("("+highlightKey+")",'g')
                var vname = name.replace(reg,'<em>$1</em>');
                list.push(So.View.template(me.tpl.suggest_item, {
                    sug: name,
                    vname:vname,
                    index: index,
                    district: poi.district,
                    address:poi.address,
                    distance: So.Util.formatDistance1(poi.distance) || 0,
                    cat_new: poi.cat_new || '',
                    child:poi.child || [],
                    pguid: poi.pguid,
                    userLocation: poi.userLocation //用户定位标识
                }));
            });

			list.push('</ul>')

            return list.join('');
		},
		showHistory: function(){
			var me = this;
			var history = this.getHistory();			
			var html = this.renderHistory(history);

			if(!(history && history.length)){
				html = '';
			}

			if(html){
				me.dialog.html(html).show();	
			}else{
				me.hideDialog({
					force: true
				});
			}
			

			this.historyData = history;
			me.isHistory = true;
		},
		getHistory: function(){
			var history = So.getPoiHistory();

			return history;
		},
		updateHistory: function(obj, opts){
			opts = opts || {};
			var value = obj.name,
				is_remove = opts.remove || false,
				handle = is_remove ? 'delete' : 'add';

			So.updatePoiHistory(obj, opts);

			//添加、删除服务端的当前名称的数据;
			$('body').trigger('app-sync-history', {
				handle: handle,
				type: 'poi',
				info: [_.extend({"time": +(new Date)}, obj)]
			});
		},
		deleteHistory: function(opts){
			opts = opts || {};
			var index = opts.index;

			if(typeof index === 'undefined'){
				return false;
			}

			var li = this.dialog.find('li').eq(index);
			var data_index = li.data('index');
			var historyData = this.historyData;
			var liData = historyData[data_index];
			var remove_name = liData.name;
			var remove_pguid = liData.pguid;

			li.remove();
			this.updateHistory({
				name: remove_name,
				pguid: remove_pguid
			}, {
				remove: true
			});			

		},
		deleteHistoryAll: function(){
			var storage_key = this.storage_key;
			var historyData = this.historyData;
			var remove_data = [];
			_.each(historyData, function(item){
				remove_data.push({
					name: item.name,
					pguid: item.pguid
				})
			});

			this.hideDialog({
				force: true
			});

			So.Util.storageItem("remove", storage_key);

			//将服务端的这些数据删除;
			$('body').trigger('app-sync-history', {
				handle: 'delete',
				type: 'poi',
				info: remove_data
			});
		},
		renderHistory: function(data){
			var me = this;
			var list = ['<ul class="suggestCon list history">'];
			_.each(data, function(item, index){
				list.push(So.View.template(me.tpl.history_item, {
					name: item.name,
					address: item.address,
					index: index
				}));
			});
			list.push('<li class="clear" data-action="deleteHistoryAll">清空搜索记录</li>');
			list.push('</ul>')

			return list.join('');
		}
	};

	return Suggest;
});