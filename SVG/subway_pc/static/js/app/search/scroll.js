define(function(require){
	var monitor = require('js/app/monitor').search;
		var rAF = window.requestAnimationFrame	||
			window.webkitRequestAnimationFrame	||
			window.mozRequestAnimationFrame		||
			window.oRequestAnimationFrame		||
			window.msRequestAnimationFrame		||
			function (callback) { window.setTimeout(callback, 1000 / 60); };

		var body_offset = $('html').offset();

		var utils = (function () {
			var me = {};

			var _elementStyle = document.createElement('div').style;
			var _vendor = (function () {
				var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
					transform,
					i = 0,
					l = vendors.length;

				for ( ; i < l; i++ ) {
					transform = vendors[i] + 'ransform';
					if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
				}

				return false;
			})();

			function _prefixStyle (style) {
				if ( _vendor === false ) return false;
				if ( _vendor === '' ) return style;
				return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
			}

			me.getTime = Date.now || function getTime () { return new Date().getTime(); };

			me.extend = function (target, obj) {
				for ( var i in obj ) {
					target[i] = obj[i];
				}
			};

			me.addEvent = function (el, type, fn, capture) {
				el.addEventListener(type, fn, !!capture);
			};

			me.removeEvent = function (el, type, fn, capture) {
				el.removeEventListener(type, fn, !!capture);
			};

			me.prefixPointerEvent = function (pointerEvent) {
				return window.MSPointerEvent ?
					'MSPointer' + pointerEvent.charAt(7).toUpperCase() + pointerEvent.substr(8):
					pointerEvent;
			};

			me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration, upperMargin) {

				//current = Math.abs(current);
				//start = Math.abs(start);


				var distance = current - start,
					speed = Math.abs(distance) / time,
					destination,
					duration;


				deceleration = deceleration === undefined ? 0.0006 : deceleration;

				destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
				duration = speed / deceleration;



				if ( destination < lowerMargin ) {
					destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
					distance = Math.abs(destination - current);
					duration = distance / speed;
				} else if ( destination > upperMargin ) {
					destination = upperMargin;
					distance = Math.abs(current) + destination;
					duration = distance / speed;
				}



				return {
					destination: Math.round(destination),
					duration: duration
				};
			};

			var _transform = _prefixStyle('transform');

			me.extend(me, {
				hasTransform: _transform !== false,
				hasPerspective: _prefixStyle('perspective') in _elementStyle,
				hasTouch: 'ontouchstart' in window,
				hasPointer: !!(window.PointerEvent || window.MSPointerEvent), // IE10 is prefixed
				hasTransition: _prefixStyle('transition') in _elementStyle
			});

			/*
			This should find all Android browsers lower than build 535.19 (both stock browser and webview)
			- galaxy S2 is ok
		    - 2.3.6 : `AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1`
		    - 4.0.4 : `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S3 is badAndroid (stock brower, webview)
		     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S4 is badAndroid (stock brower, webview)
		     `AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30`
		   - galaxy S5 is OK
		     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
		   - galaxy S6 is OK
		     `AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36 (Chrome/)`
		  */
			me.isBadAndroid = (function() {
				var appVersion = window.navigator.appVersion;
				// Android browser is not a chrome browser.
				if (/Android/.test(appVersion) && !(/Chrome\/\d/.test(appVersion))) {
					var safariVersion = appVersion.match(/Safari\/(\d+.\d)/);
					if(safariVersion && typeof safariVersion === "object" && safariVersion.length >= 2) {
						return parseFloat(safariVersion[1]) < 535.19;
					} else {
						return true;
					}
				} else {
					return false;
				}
			})();

			me.extend(me.style = {}, {
				transform: _transform,
				transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
				transitionDuration: _prefixStyle('transitionDuration'),
				transitionDelay: _prefixStyle('transitionDelay'),
				transformOrigin: _prefixStyle('transformOrigin'),
				touchAction: _prefixStyle('touchAction')
			});

			me.hasClass = function (e, c) {
				var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
				return re.test(e.className);
			};

			me.addClass = function (e, c) {
				if ( me.hasClass(e, c) ) {
					return;
				}

				var newclass = e.className.split(' ');
				newclass.push(c);
				e.className = newclass.join(' ');
			};

			me.removeClass = function (e, c) {
				if ( !me.hasClass(e, c) ) {
					return;
				}

				var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
				e.className = e.className.replace(re, ' ');
			};

			me.offset = function (el) {
				var left = -el.offsetLeft,
					top = -el.offsetTop;

				// jshint -W084
				while (el = el.offsetParent) {
					left -= el.offsetLeft;
					top -= el.offsetTop;
				}
				// jshint +W084

				return {
					left: left,
					top: top
				};
			};

			me.preventDefaultException = function (el, exceptions) {
				for ( var i in exceptions ) {
					if ( exceptions[i].test(el[i]) ) {
						return true;
					}
				}

				return false;
			};

			me.extend(me.eventType = {}, {
				touchstart: 1,
				touchmove: 1,
				touchend: 1,

				mousedown: 2,
				mousemove: 2,
				mouseup: 2,

				pointerdown: 3,
				pointermove: 3,
				pointerup: 3,

				MSPointerDown: 3,
				MSPointerMove: 3,
				MSPointerUp: 3
			});

			me.extend(me.ease = {}, {
				quadratic: {
					style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
					fn: function (k) {
						return k * ( 2 - k );
					}
				},
				circular: {
					style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
					fn: function (k) {
						return Math.sqrt( 1 - ( --k * k ) );
					}
				},
				back: {
					style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
					fn: function (k) {
						var b = 4;
						return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
					}
				},
				bounce: {
					style: '',
					fn: function (k) {
						if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
							return 7.5625 * k * k;
						} else if ( k < ( 2 / 2.75 ) ) {
							return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
						} else if ( k < ( 2.5 / 2.75 ) ) {
							return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
						} else {
							return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
						}
					}
				},
				elastic: {
					style: '',
					fn: function (k) {
						var f = 0.22,
							e = 0.4;

						if ( k === 0 ) { return 0; }
						if ( k == 1 ) { return 1; }

						return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
					}
				}
			});

			me.tap = function (e, eventName) {
				var ev = document.createEvent('Event');
				ev.initEvent(eventName, true, true);
				ev.pageX = e.pageX;
				ev.pageY = e.pageY;
				e.target.dispatchEvent(ev);
			};

			me.dispatchEvent = function (e, type) {
				var target = e.target,
					ev;

				if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
					// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/initMouseEvent
					// initMouseEvent is deprecated.
					ev = document.createEvent(window.MouseEvent ? 'MouseEvents' : 'Event');
					ev.initEvent(type, true, true);
					ev.view = e.view || window;
					ev.detail = 1;
					ev.screenX = target.screenX || 0;
					ev.screenY = target.screenY || 0;
					ev.clientX = target.clientX || 0;
					ev.clientY = target.clientY || 0;
					ev.ctrlKey = !!e.ctrlKey;
					ev.altKey = !!e.altKey;
					ev.shiftKey = !!e.shiftKey;
					ev.metaKey = !!e.metaKey;
					ev.button = 0;
					ev.relatedTarget = null;
					ev._constructed = true;
					target.dispatchEvent(ev);
				}
			};

			me.getTouchAction = function(eventPassthrough, addPinch) {
				var touchAction = 'none';
				if ( eventPassthrough === 'vertical' ) {
					touchAction = 'pan-y';
				} else if (eventPassthrough === 'horizontal' ) {
					touchAction = 'pan-x';
				}
				if (addPinch && touchAction != 'none') {
					// add pinch-zoom support if the browser supports it, but if not (eg. Chrome <55) do nothing
					touchAction += ' pinch-zoom';
				}
				return touchAction;
			};

			me.getRect = function(el) {
				if (el instanceof SVGElement) {
					var rect = el.getBoundingClientRect();
					return {
						top : rect.top,
						left : rect.left,
						width : rect.width,
						height : rect.height
					};
				} else {
					return {
						top : el.offsetTop,
						left : el.offsetLeft,
						width : el.offsetWidth,
						height : el.offsetHeight
					};
				}
			};

			return me;
		})();

		var STATE_COLLAPSED_ALL = 'collapsed_all'; //列表折叠状态，显示查看更多按钮
		var STATE_COLLAPSED = 'collapsed'; //列表折叠状态，显示2条结果
		var STATE_EXPANDED = 'expanded'; //列表展开状态，没有地图，全是列表
		var BTN_HEIGHT = 47; //查看全部按钮高度;

		function IScroll (el, options) {
			this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
			this.scroller = this.wrapper;
			this.show_all_btn = $(this.wrapper).find('.show_all_btn');
			this.scrollerStyle = this.scroller.style;		// cache style for better performance
			this.state = STATE_COLLAPSED;
			this._state = ''; //临时记录的state状态,end后会将_state的状态赋值到state
			this._touchended = true; //记录touchend事件是否执行完毕
			this._timer = null; //记录ios系统，部分浏览器，部分操作情况下不触发  touchend事件

			this.options = {

				resizeScrollbars: true,

				mouseWheelSpeed: 20,

				snapThreshold: 0.334,

		// INSERT POINT: OPTIONS
				disablePointer : !utils.hasPointer,
				disableTouch : utils.hasPointer || !utils.hasTouch,
				disableMouse : utils.hasPointer || utils.hasTouch,
				startX: 0,
				startY: 0,
				scrollY: true,
				directionLockThreshold: 5,
				momentum: true,

				bounce: true,
				bounceTime: 600,
				bounceEasing: '',

				preventDefault: true,
				preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

				HWCompositing: true,
				useTransition: true,
				useTransform: true,
				bindToWrapper: typeof window.onmousedown === "undefined"
			};

			for ( var i in options ) {
				this.options[i] = options[i];
			}

			// Normalize options
			this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

			this.options.useTransition = utils.hasTransition && this.options.useTransition;
			this.options.useTransform = utils.hasTransform && this.options.useTransform;

			this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
			this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

			// If you want eventPassthrough I have to lock one of the axes
			this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
			this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

			// With eventPassthrough we also need lockDirection mechanism
			this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
			this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

			this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

			this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

			if ( this.options.tap === true ) {
				this.options.tap = 'tap';
			}

			// https://github.com/cubiq/iscroll/issues/1029
			if (!this.options.useTransition && !this.options.useTransform) {
				if(!(/relative|absolute/i).test(this.scrollerStyle.position)) {
					this.scrollerStyle.position = "relative";
				}
			}

			if ( this.options.shrinkScrollbars == 'scale' ) {
				this.options.useTransition = false;
			}

			this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

		// INSERT POINT: NORMALIZATION

			// Some defaults
			this.x = 0;
			this.y = 0;
			this.directionX = 0;
			this.directionY = 0;
			this._events = {};

		// INSERT POINT: DEFAULTS

			this._init();
			this.refresh();

			this.scrollTo(this.options.startX, this.options.startY);
			this.enable();
		}

		IScroll.prototype = {
			version: '5.2.0-snapshot',

			_init: function () {
				var list_container = $(this.wrapper).find('ul');
				var poi_count = list_container.find('li').length;
				var _listHeight = list_container.offset().height;

				//this._defaultListHeight = list_container.offset().height + (poi_count > 3 ? 30 : 0); //+30是为了将下一条漏出一点，让用户知道下面还有
				this._mapOffsetTop = $('#mapDiv').offset().top;
				this._defaultListHeight = Math.min(Math.round((body_offset.height - this._mapOffsetTop) * 0.62), _listHeight);

				this._curListHeight = this._defaultListHeight;
				this._listOffsetTop = body_offset.height - this._defaultListHeight - this._mapOffsetTop;
				this._btnOffsetTop = this._defaultListHeight - BTN_HEIGHT;


				//存储列表的高度，定位的时候，设置地图中心店使用;
				$(this.wrapper).data('list-height', this._defaultListHeight);



				//设置初始状态
				this.state == STATE_COLLAPSED;

				$(this.wrapper).css('top', this._listOffsetTop + 'px');
				$(this.wrapper).addClass('list_showall');

				$('body').trigger('map_list-updateListHei', {
					curListHeight: this._curListHeight
				});

				//poi结果小于3条的时候不能滑动
				// if(this.options._poi_count < 3){
				// 	return false;
				// }

				this._initEvents();

		// INSERT POINT: _init

			},


			destroy: function () {
				var wrapper = $(this.wrapper);


				wrapper.removeClass('list_showall');
				wrapper.removeClass("list_showall_btn");
				$('body').removeClass("_list_showall_btn_");
				wrapper.removeClass("list_" + STATE_EXPANDED);
				wrapper.removeClass("list_" + STATE_COLLAPSED);
				wrapper.removeClass("list_" + STATE_COLLAPSED_ALL);
				$('body').removeClass("list_" + STATE_EXPANDED);
				var styles = {};
				styles[utils.style.transform] = "none";
                wrapper.css(styles);
				this._initEvents(true);
				clearTimeout(this.resizeTimeout);
		 		this.resizeTimeout = null;
				this._execEvent('destroy');
			},

			_transitionEnd: function (e) {

				if ( e.target != this.scroller || !this.isInTransition ) {
					return;
				}

				this._transitionTime();
				if ( !this.resetPosition(this.options.bounceTime) ) {
					this.isInTransition = false;
					this._execEvent('scrollEnd');
				}
			},

			_start: function (e) {				
				//ios部分浏览器，部分操作会丢失touchend事件，使用timer延时判断 window.event是否存在处理
				this._touchended = false;

				// React to left mouse button only
				if ( utils.eventType[e.type] != 1 ) {
				  // for button property
				  // http://unixpapa.com/js/mouse.html
				  var button;
			    if (!e.which) {
			      /* IE case */
			      button = (e.button < 2) ? 0 :
			               ((e.button == 4) ? 1 : 2);
			    } else {
			      /* All others */
			      button = e.button;
			    }
					if ( button !== 0 ) {
						return;
					}
				}

				if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
					return;
				}

				if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
					e.preventDefault();
				}

				var point = e.touches ? e.touches[0] : e,
					pos;

				this.initiated	= utils.eventType[e.type];
				this.moved		= false;
				this.distX		= 0;
				this.distY		= 0;
				this.directionX = 0;
				this.directionY = 0;
				this.directionLocked = 0;

				this.startTime = utils.getTime();

				if ( this.options.useTransition && this.isInTransition ) {
					this._transitionTime();
					this.isInTransition = false;
					pos = this.getComputedPosition();
					this._translate(Math.round(pos.x), Math.round(pos.y));
					this._execEvent('scrollEnd');
				} else if ( !this.options.useTransition && this.isAnimating ) {
					this.isAnimating = false;
					this._execEvent('scrollEnd');
				}

				this.startX    = this.x;
				this.startY    = this.y;
				this.absStartX = this.x;
				this.absStartY = this.y;
				this.pointX    = point.pageX;
				this.pointY    = point.pageY;

				this._execEvent('beforeScrollStart');
			},

			_move: function (e) {
				//ios部分浏览器，部分操作会丢失touchend事件，使用timer延时判断 window.event是否存在处理
				this._touchended = false;

				if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
					return;
				}

				if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
					e.preventDefault();
				}

				var me 			= this,
					_event 		= e,
					point		= e.touches ? e.touches[0] : e,
					deltaX		= point.pageX - this.pointX,
					deltaY		= point.pageY - this.pointY,
					timestamp	= utils.getTime(),
					newX, newY,
					absDistX, absDistY;

				this.pointX		= point.pageX;
				this.pointY		= point.pageY;

				this._timer && clearTimeout(this._timer);
				this._timer = setTimeout(function(){
					if(!this._touchended && !window.event){
						me._end(_event);
					}
				},100);

				//IOS8 手滑动离开webview范围后不触发touchend bug处理
				if(this.pointY <=0 || this.pointY >= body_offset.height){
					this._end(e);
					return false;
				}

				this.distX		+= deltaX;
				this.distY		+= deltaY;
				absDistX		= Math.abs(this.distX);
				absDistY		= Math.abs(this.distY);

				this.updateMaxScrollY();


				// We need to move at least 10 pixels for the scrolling to initiate
				if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
					return;
				}

				// If you are scrolling in one direction lock the other
				if ( !this.directionLocked && !this.options.freeScroll ) {
					if ( absDistX > absDistY + this.options.directionLockThreshold ) {
						this.directionLocked = 'h';		// lock horizontally
					} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
						this.directionLocked = 'v';		// lock vertically
					} else {
						this.directionLocked = 'n';		// no lock
					}
				}

				if ( this.directionLocked == 'h' ) {
					if ( this.options.eventPassthrough == 'vertical' ) {
						e.preventDefault();
					} else if ( this.options.eventPassthrough == 'horizontal' ) {
						this.initiated = false;
						return;
					}

					//deltaY = 0;
				} else if ( this.directionLocked == 'v' ) {
					if ( this.options.eventPassthrough == 'horizontal' ) {
						e.preventDefault();
					} else if ( this.options.eventPassthrough == 'vertical' ) {
						this.initiated = false;
						return;
					}

					deltaX = 0;
				}

				deltaX = this.hasHorizontalScroll ? deltaX : 0;
				// deltaY = this.hasVerticalScroll ? deltaY : 0;




				newX = this.x + deltaX;
				newY = this.y + deltaY;


				// Slow down if outside of the boundaries
				// if ( newX > 0 || newX < this.maxScrollX ) {
				// 	newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
				// }
				if (newY < this.maxScrollY ) {
					newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
				}

				this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
				this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

				if ( !this.moved ) {
					this._execEvent('scrollStart');
				}





				this.moved = true;

				this._translate(newX, newY);

		/* REPLACE START: _move */

				if ( timestamp - this.startTime > 300 ) {
					this.startTime = timestamp;
					this.startX = this.x;
					this.startY = this.y;
				}

		/* REPLACE END: _move */

			},

			_end: function (e) {
				//ios部分浏览器，部分操作会丢失touchend事件，使用timer延时判断 window.event是否存在处理
				this._touchended = true;

				if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
					return;
				}

				if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
					e.preventDefault();
				}


				var point = e.changedTouches ? e.changedTouches[0] : e,
					momentumX,
					momentumY,
					duration = utils.getTime() - this.startTime,
					newX = Math.round(this.x),
					newY = Math.round(this.y),
					distanceX = Math.abs(newX - this.startX),
					distanceY = Math.abs(newY - this.startY),
					time = 0,
					easing = '';

				this.isInTransition = 0;
				this.initiated = 0;
				this.endTime = utils.getTime();



				// reset if we are outside of the boundaries
				if ( this.resetPosition(this.options.bounceTime) ) {
					return;
				}

				this.scrollTo(newX, newY);	// ensures that the last position is rounded



				// we scrolled less than 10 pixels
				if ( !this.moved ) {
					if ( this.options.tap ) {
						utils.tap(e, this.options.tap);
					}

					//触发事件的顺序不能调整

					if ( this.options.mousedown ) {
						utils.dispatchEvent(e, 'mousedown');
					}
					if ( this.options.mouseup ) {
						utils.dispatchEvent(e, 'mouseup');
					}
					if ( this.options.click ) {
						utils.dispatchEvent(e, 'click');
					}
					

					this._execEvent('scrollCancel');
					return;
				}



				if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
					this._execEvent('flick');
					return;
				}



				// start momentum animation if needed

				if ( this.options.momentum && duration < 300 ) {

					momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration, -this._listOffsetTop) : { destination: newX, duration: 0 };
					momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration, -this._listOffsetTop) : { destination: newY, duration: 0 };
					newX = momentumX.destination;
					newY = momentumY.destination;
					time = Math.max(momentumX.duration, momentumY.duration);
					this.isInTransition = 1;
				}

		// INSERT POINT: _end

				if ( newX != this.x || newY != this.y ) {
					// change easing function when scroller goes out of the boundaries
					if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
						easing = utils.ease.quadratic;
					}

					this.scrollTo(newX, newY, time, easing);
					return;
				}


				this._execEvent('scrollEnd');
			},

			_resize: function () {

				var that = this;

				clearTimeout(this.resizeTimeout);

				this.resizeTimeout = setTimeout(function () {
					that.refresh();
				}, this.options.resizePolling);
			},

			resetPosition: function (time) {

				var me = this,
					wrapper = $(this.wrapper),
					x = this.x,
					y = this.y;

				time = time || 0;

				wrapper.removeClass("list_showall_btn");
				$('body').removeClass("_list_showall_btn_");
				wrapper.removeClass("list_" + STATE_EXPANDED);
				wrapper.removeClass("list_" + STATE_COLLAPSED);
				wrapper.removeClass("list_" + STATE_COLLAPSED_ALL);
				$('body').removeClass("list_" + STATE_EXPANDED);

				if ( !this.hasHorizontalScroll || this.x > 0 ) {
					x = 0;
				} else if ( this.x < this.maxScrollX ) {
					x = this.maxScrollX;
				}

				//距离底部150的时候开始加载，加载更多loading动画120高
				if(Math.abs(this.maxScrollY) - Math.abs(this.y) < 150){
					//触发加载更多;
					$('body').trigger('map_list-loadmore', function(){
						me.updateMaxScrollY();
					});
				}

				if ( !this.hasVerticalScroll || this.y > 0 ) {

					//y = 0;
				} else if ( this.y < this.maxScrollY ) {


					y = this.maxScrollY;



				}
				//折叠状态下
				if(this.state == STATE_COLLAPSED){

					//向上滑
					if(this.directionY == 1){
						y = -this._listOffsetTop;

						this._state = STATE_EXPANDED;

						wrapper.addClass("list_" + STATE_EXPANDED);
						$('body').addClass("list_" + STATE_EXPANDED);

					//向下拉
					}else if(this.directionY == -1){
						y = this._btnOffsetTop;
						wrapper.addClass("list_showall_btn");
						$('body').addClass("_list_showall_btn_");

						this._curListHeight = BTN_HEIGHT;

						this._state = STATE_COLLAPSED_ALL;

						wrapper.addClass("list_" + STATE_COLLAPSED_ALL);

						//存储列表的高度，定位的时候，设置地图中心店使用;
						wrapper.data('list-height', BTN_HEIGHT);

					}
				//点击查看全部状态
				}else if(this.state == STATE_COLLAPSED_ALL){
					//向上滑
					if(this.directionY == 1 || this.directionY == 0){
						y = 0;

						this._state = STATE_COLLAPSED;
						this._curListHeight = this._defaultListHeight;

						wrapper.addClass("list_" + STATE_COLLAPSED);

						//存储列表的高度，定位的时候，设置地图中心店使用;
						wrapper.data('list-height', this._defaultListHeight);

						monitor.click.more()
					//向下拉
					}else if(this.directionY == -1){
						y = this._btnOffsetTop;

						wrapper.addClass("list_showall_btn");
						$('body').addClass("_list_showall_btn_");

						wrapper.addClass("list_" + STATE_COLLAPSED_ALL);

					}

				//列表状态
				}else if(this.state == STATE_EXPANDED){

					wrapper.addClass("list_" + STATE_EXPANDED);
					$('body').addClass("list_" + STATE_EXPANDED);
					//向上滑
					if(this.directionY == 1){
						
					//向下拉
					}else if(this.directionY == -1){

						if(this.startY >= -this._listOffsetTop){

							if(y < -(this._listOffsetTop - 50)){
								y = -this._listOffsetTop;
								this._state = STATE_EXPANDED;

							}else{
								y = 0;
								this._state = STATE_COLLAPSED;
								wrapper.removeClass("list_" + STATE_EXPANDED);
								$('body').removeClass("list_" + STATE_EXPANDED);
								wrapper.addClass("list_" + STATE_COLLAPSED);

								//存储列表的高度，定位的时候，设置地图中心店使用;
								wrapper.data('list-height', this._defaultListHeight);
							}
						}else{
							// y = 0;

							// this._state = STATE_COLLAPSED;
							// this._curListHeight = this._defaultListHeight;

							// wrapper.addClass("list_" + STATE_COLLAPSED);
						}

						
					}
				}






				if ( x == this.x && y == this.y ) {

					return false;
				}

				//更新Y最大值
				this.updateMaxScrollY();



				this.scrollTo(x, y, time, this.options.bounceEasing);

				$('body').trigger('map_list-touchend', {
					curListHeight: this._curListHeight
				});

				return true;
			},

			disable: function () {

				this.enabled = false;
			},

			enable: function () {

				this.enabled = true;
			},

			updateMaxScrollY: function(){
				this.maxScrollY		= -($(this.wrapper).find('.list-container').offset().height - this._defaultListHeight + $('#super_map_sort1').offset().height);
			},

			refresh: function () {

				utils.getRect(this.wrapper);		// Force reflow

				this.wrapperWidth	= this.wrapper.clientWidth;
				this.wrapperHeight	= this.wrapper.clientHeight;

				var rect = utils.getRect(this.scroller);
		/* REPLACE START: refresh */

				this.scrollerWidth	= rect.width;
				this.scrollerHeight	= rect.height;

				this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;

				this.updateMaxScrollY();

		/* REPLACE END: refresh */

				this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
				this.hasVerticalScroll		= true;

				if ( !this.hasHorizontalScroll ) {
					this.maxScrollX = 0;
					this.scrollerWidth = this.wrapperWidth;
				}

				if ( !this.hasVerticalScroll ) {
					this.maxScrollY = 0;
					this.scrollerHeight = this.wrapperHeight;
				}

				this.endTime = 0;
				this.directionX = 0;
				this.directionY = 0;

				if(utils.hasPointer && !this.options.disablePointer) {
					// The wrapper should have `touchAction` property for using pointerEvent.
					this.wrapper.style[utils.style.touchAction] = utils.getTouchAction(this.options.eventPassthrough, true);

					// case. not support 'pinch-zoom'
					// https://github.com/cubiq/iscroll/issues/1118#issuecomment-270057583
					if (!this.wrapper.style[utils.style.touchAction]) {
						this.wrapper.style[utils.style.touchAction] = utils.getTouchAction(this.options.eventPassthrough, false);
					}
				}
				this.wrapperOffset = utils.offset(this.wrapper);

				this._execEvent('refresh');

				this.resetPosition();

		// INSERT POINT: _refresh

			},

			on: function (type, fn) {

				if ( !this._events[type] ) {
					this._events[type] = [];
				}

				this._events[type].push(fn);
			},

			off: function (type, fn) {

				if ( !this._events[type] ) {
					return;
				}

				var index = this._events[type].indexOf(fn);

				if ( index > -1 ) {
					this._events[type].splice(index, 1);
				}
			},

			_execEvent: function (type) {

				if(type == 'scrollEnd'){
					//记录当前的页面状态
					this.state = this._state;
				}
				if ( !this._events[type] ) {
					return;
				}

				var i = 0,
					l = this._events[type].length;

				if ( !l ) {
					return;
				}

				for ( ; i < l; i++ ) {
					this._events[type][i].apply(this, [].slice.call(arguments, 1));
				}
			},


			scrollTo: function (x, y, time, easing) {

				easing = easing || utils.ease.circular;

				this.isInTransition = this.options.useTransition && time > 0;
				var transitionType = this.options.useTransition && easing.style;
				if ( !time || transitionType ) {
						if(transitionType) {
							this._transitionTimingFunction(easing.style);
							this._transitionTime(time);
						}
					this._translate(x, y);
				} else {
					this._animate(x, y, time, easing.fn);
				}
			},

			_transitionTime: function (time) {

				if (!this.options.useTransition) {
					return;
				}
				time = time || 0;
				var durationProp = utils.style.transitionDuration;
				if(!durationProp) {
					return;
				}

				this.scrollerStyle[durationProp] = time + 'ms';

				if ( !time && utils.isBadAndroid ) {
					this.scrollerStyle[durationProp] = '0.0001ms';
					// remove 0.0001ms
					var self = this;
					rAF(function() {
						if(self.scrollerStyle[durationProp] === '0.0001ms') {
							self.scrollerStyle[durationProp] = '0s';
						}
					});
				}


				if ( this.indicators ) {
					for ( var i = this.indicators.length; i--; ) {
						this.indicators[i].transitionTime(time);
					}
				}


		// INSERT POINT: _transitionTime

			},

			_transitionTimingFunction: function (easing) {

				this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


				if ( this.indicators ) {
					for ( var i = this.indicators.length; i--; ) {
						this.indicators[i].transitionTimingFunction(easing);
					}
				}


		// INSERT POINT: _transitionTimingFunction

			},

			_translate: function (x, y) {

				if ( this.options.useTransform ) {

		/* REPLACE START: _translate */

					this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

		/* REPLACE END: _translate */

				} else {
					x = Math.round(x);
					y = Math.round(y);
					this.scrollerStyle.left = x + 'px';
					this.scrollerStyle.top = y + 'px';
				}

				this.x = x;
				this.y = y;


			if ( this.indicators ) {
				for ( var i = this.indicators.length; i--; ) {
					this.indicators[i].updatePosition();
				}
			}



		// INSERT POINT: _translate

			},

			_initEvents: function (remove) {

				var eventType = remove ? utils.removeEvent : utils.addEvent,
					target = this.options.bindToWrapper ? this.wrapper : window;

				eventType(window, 'orientationchange', this);
				eventType(window, 'resize', this);

				if ( this.options.click ) {
					eventType(this.wrapper, 'click', this, true);
				}


				if ( utils.hasPointer && !this.options.disablePointer ) {
					eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
					eventType(target, utils.prefixPointerEvent('pointermove'), this);
					eventType(target, utils.prefixPointerEvent('pointercancel'), this);
					eventType(target, utils.prefixPointerEvent('pointerup'), this);
				}

				if ( utils.hasTouch && !this.options.disableTouch ) {
					eventType(this.wrapper, 'touchstart', this);
					eventType(target, 'touchmove', this);
					eventType(target, 'touchcancel', this);
					eventType(target, 'touchend', this);
				}

				eventType(this.scroller, 'transitionend', this);
				eventType(this.scroller, 'webkitTransitionEnd', this);
				eventType(this.scroller, 'oTransitionEnd', this);
				eventType(this.scroller, 'MSTransitionEnd', this);
			},

			getComputedPosition: function () {

				var matrix = window.getComputedStyle(this.scroller, null),
					x, y;

				if ( this.options.useTransform ) {
					matrix = matrix[utils.style.transform].split(')')[0].split(', ');
					x = +(matrix[12] || matrix[4]);
					y = +(matrix[13] || matrix[5]);
				} else {
					x = +matrix.left.replace(/[^-\d.]/g, '');
					y = +matrix.top.replace(/[^-\d.]/g, '');
				}

				return { x: x, y: y };
			},

			_animate: function (destX, destY, duration, easingFn) {

				var that = this,
					startX = this.x,
					startY = this.y,
					startTime = utils.getTime(),
					destTime = startTime + duration;

				function step () {
					var now = utils.getTime(),
						newX, newY,
						easing;

					if ( now >= destTime ) {
						that.isAnimating = false;
						that._translate(destX, destY);

						if ( !that.resetPosition(that.options.bounceTime) ) {
							that._execEvent('scrollEnd');
						}

						return;
					}

					now = ( now - startTime ) / duration;
					easing = easingFn(now);
					newX = ( destX - startX ) * easing + startX;
					newY = ( destY - startY ) * easing + startY;
					that._translate(newX, newY);

					if ( that.isAnimating ) {
						rAF(step);
					}
				}

				this.isAnimating = true;
				step();
			},
			handleEvent: function (e) {

				switch ( e.type ) {
					case 'touchstart':
					case 'pointerdown':
					case 'MSPointerDown':
					case 'mousedown':
						this._start(e);
						break;
					case 'touchmove':
					case 'pointermove':
					case 'MSPointerMove':
					case 'mousemove':
						this._move(e);
						break;
					case 'touchend':
					case 'pointerup':
					case 'MSPointerUp':
					case 'mouseup':
					case 'touchcancel':
					case 'pointercancel':
					case 'MSPointerCancel':
					case 'mousecancel':
						this._end(e);
						break;
					case 'orientationchange':
					case 'resize':
						this._resize();
						break;
					case 'transitionend':
					case 'webkitTransitionEnd':
					case 'oTransitionEnd':
					case 'MSTransitionEnd':
						this._transitionEnd(e);
						break;
					case 'click':
						if ( this.enabled && !e._constructed ) {
							e.preventDefault();
							e.stopPropagation();
						}
						break;
				}
			}
		};


		IScroll.utils = utils;

		return IScroll;
});
