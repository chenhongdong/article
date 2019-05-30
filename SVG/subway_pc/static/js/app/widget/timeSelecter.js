define(function(require) {
    var isLeapyear = function(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0
        },
        getMaxDay = function(year, month) {
            var dates = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if(isLeapyear(year)){
                dates[1] = 29;
            }

            return dates[month - 1];
        },
        formatDate = function(time, t) {
            var e, r = {
                // "M+": time.getMonth() + 1,
                // "d+": time.getDate(),
                "h+": time.getHours(),
                "m+": time.getMinutes(),
                "s+": time.getSeconds(),
                "q+": Math.floor((time.getMonth() + 3) / 3),
                S: time.getMilliseconds()
            };
            // if(/(y+)/.test(t)){
            //     t = t.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
            // }
            for (e in r){
                if(new RegExp("(" + e + ")").test(t)){
                    t = t.replace(RegExp.$1, 1 === RegExp.$1.length ? r[e] : ("00" + r[e]).substr(("" + r[e]).length))
                }
            }
            return t
        };

    var TimeSelecter = function(){
        this.ele = {};
        this.scroller = {};
        this.time = {};
        this.init();
        this.isShow = false;
    };
    $.extend(TimeSelecter.prototype, {
        lineHeight: 48,
        init: function(){
            this.createElement();
            this.initScroll();
            this.bindEvent();
            this.reset();
        },
        reset: function(opts){
            opts = opts || {};
            var date = opts.date || '';
            this.scrollToDate(date);
        },
        createElement: function(){
            this.ele.container = $('<div class="flexbox timeCon" style="left:-10000px"></div>');
            var container = this.ele.container;

            //this.ele.dateCon = $('<div class="flex-item dateCon" data-scroll="date"></div>');
            this.ele.HourCon = $('<div class="flex-item HourCon" data-scroll="hour"></div>');
            this.ele.minuteCon = $('<div class="flex-item minuteCon" data-scroll="minute"></div>');         

            //container.append(this.ele.dateCon);
            container.append(this.ele.HourCon);
            container.append(this.ele.minuteCon);

            //创建底部横线;
            var lineEles = ['<div class="lineCon">'];

            lineEles.push('<ul>');
            lineEles.push(' <li></li>');
            lineEles.push(' <li></li>');
            lineEles.push('</ul>');
            lineEles.push('</div>');

            container.append($(lineEles.join('')));

            this.createTime();
            this.ele.container.appendTo('body');
        },
        createTime: function(){
            var className, 
                time = new Date(),//So.now),
                year = time.getFullYear(),
                month = time.getMonth() + 1,
                date = time.getDate(),
                hour = time.getHours(),
                minute = time.getMinutes(),
                days = [],
                max_date = getMaxDay(time.getFullYear(), month),
                date_htmls = [],
                month_htmls = [],
                day_htmls = [];

            //当前月
            // for (var _date = date; _date<=max_date; _date++){
            //     days.push({
            //         y: year,
            //         m: month,
            //         d: _date
            //     });
            // }
            // var next_month = month + 1,
            //     _year = time.getFullYear(),
            //     next_month_max_date;

            // //如果是最后一个月，则年+1，月=1
            // if(month == 12){
            //     next_month = 1;
            //     _year += 1
            // }

            // next_month_max_date = getMaxDay(_year, next_month);

            // //下一个月
            // for (var next_date = 1; next_date<=next_month_max_date; next_date++){
            //     days.push({
            //         y: _year,
            //         m: next_month,
            //         d: next_date
            //     });
            // }

            //创建月日选择框
            // date_htmls = ["<ul><li>&nbsp;</li>"];
            // days.forEach(function(t) {
            //     var i = t.m + "月" + t.d + "日",
            //         s = new Date;
            //         s.setFullYear(t.y),
            //         s.setMonth(t.m - 1),
            //         s.setDate(t.d);
            //     var e = formatDate(s, "yyyy-MM-dd");
            //     date_htmls.push('<li id="date-' + e + '" data-value="' + e + '">' + i + "</li>");
            // });
            // date_htmls.push('<li>&nbsp;</li></ul>');
            //this.ele.dateCon.html(date_htmls.join(''));

            //创建小时选择框
            month_htmls.push('<ul><li>&nbsp;</li>');
            for (var g = 0; 24 > g; g++){
                g = g >= 10 ? g: "0" + g;
                month_htmls.push('<li id="hour-' + g + '" data-value="' + g + '">' + g + "</li>");
            }
            month_htmls.push("<li>&nbsp;</li></ul>");
            this.ele.HourCon.html(month_htmls.join(''));

            //创建分钟选择框
            day_htmls.push('<ul><li>&nbsp;</li>');
            for (var b = 0; 60 > b; b += 10) {
                var p = 0 === b ? "00": b;
                day_htmls.push('<li id="minute-' + p + '" data-value="' + p + '">' + p + "</li>");
            }
            day_htmls.push("<li>&nbsp;</li></ul>");
            this.ele.minuteCon.html(day_htmls.join(''));

        },
        initScroll: function(){
            var me = this,
                scroller = me.scroller,
                eles = this.ele;

            // scroller.date = new IScroll(eles.dateCon.get(0),{
            //     'resizeScrollbars': false,
            //     'click': true,
            //     'bounceTime': 200
            // });

            // scroller.date.on('scrollEnd', function(){
            //     me.scrollToEle(this);
            // });

            scroller.hour = new IScroll(eles.HourCon.get(0),{
                'resizeScrollbars': false,
                'click': true,
                'bounceTime': 200
            });

            scroller.hour.on('scrollEnd', function(){
                me.scrollToEle(this);
            });

            scroller.minute = new IScroll(eles.minuteCon.get(0),{
                'resizeScrollbars': false,
                'click': true,
                'bounceTime': 200
            });

            scroller.minute.on('scrollEnd', function(){
                me.scrollToEle(this);
            });
        },
        scrollToEle: function(scroll, opts) {
            opts = opts || {};
            var scrollTop = Math.abs(scroll.y),
                bounceTime = opts.bounceTime || 0,
                scrollCon = $(scroll.wrapper),
                conType = scrollCon.data('scroll'),
                lis = scrollCon.find("li"),
                ele,
                time_ele,
                value;

            if(opts.ele){
                ele = opts.ele;
            }else{
                var index = Math.round(scrollTop / this.lineHeight);
                ele = lis.get(index);
            }
            time_ele = $(ele).next();
            value = time_ele.data('value');

            //如果没有时间则返回;如：点击空行时
            if(!value){
                return false;
            }

            this.time[conType] = value;
            
            lis.removeClass("active");
            time_ele.addClass("active");
            scroll.scrollToElement(ele, bounceTime);
        },
        scrollToDate: function(time){
            time = time || '';
            var now = new Date();//So.now);
            now = new Date(now.getTime() + (10 - now.getMinutes() % 10) % 10 * 6e4);

            var cur_year = now.getFullYear(),
                cur_month = now.getMonth()+1,
                cur_day = now.getDate(),
                cur_hour = now.getHours(),
                cur_minute = now.getMinutes(),
                time = time.split(' '),
                time1 = time[1] && time[1].split(':'),
                date = time[0],
                hours = time1 && time1[0],
                minute = time1 && time1[1],
                dateEle,
                hoursEle,
                minuteEle;

            //日期不足两位的用0补齐;
            cur_month = cur_month < 10 ? '0'+cur_month : cur_month;
            cur_day = cur_day < 10 ? '0'+cur_day : cur_day;
            cur_hour = cur_hour < 10 ? '0'+cur_hour : cur_hour;
            cur_minute = cur_minute < 10 ? '0'+cur_minute : cur_minute;

            //如果指定了日期的使用指定的日期;
            //date = date || (cur_year + '-' + cur_month + '-' + cur_day);
            hours = hours || cur_hour;
            minute = minute || cur_minute;

            
            //dateEle = $("#date-" + date).prev().get(0);
            hoursEle = $("#hour-" + hours).prev().get(0);
            minuteEle = $("#minute-" + minute).prev().get(0);


            //this.scrollToEle(this.scroller.date, {ele:dateEle});
            this.scrollToEle(this.scroller.hour, {ele:hoursEle});
            this.scrollToEle(this.scroller.minute, {ele:minuteEle});
        },
        getCurTime: function(){
            return this.time.hour + ':' + this.time.minute;
        },
        bindEvent: function(){
            var me = this,
                ele = me.ele;

            ele.container.delegate('li', 'click', function(){
                var ele = $(this),
                    parent = ele.closest('div[data-scroll]'),
                    scroll = parent.data('scroll'),
                    lastTime = parent.data('lasttime'),
                    time = +new Date;

                parent.data('lasttime', time);

                //在1加手机自带浏览器上会触发两次点击，添加时间戳判断，防止触发连续点击;
                if(lastTime && time - lastTime < 500){
                    return false;
                }

                me.scrollToEle(me.scroller[scroll], {
                    ele:ele.prev().get(0),
                    bounceTime: 0 //启用滚动效果后在低端手机上会滚动错位
                });
            });

            ele.container.on('webkitAnimationEnd', function(){
                var ele = $(this),
                    slideIn = ele.hasClass('animation-slideIn'),
                    slideOut = ele.hasClass('animation-slideOut');

                ele.removeClass('animation-slideIn animation-slideOut');

                if(slideOut){
                    ele.css({
                        left: '-10000px',
                        zIndex: "-1"
                    })
                }
            });
        },
        show: function(opts){
            opts = opts || {};
            var me = this,
                container = me.ele.container;
            if(this.isShow){
                return false;
            }
            this.reset(opts);
            container.css({
                left: '0',
                zIndex: ""
            });
            container.addClass('animation-slideIn');
            this.isShow = true;
        },
        hide: function(){
            if(!this.isShow){
                return false;
            }
            this.ele.container.addClass('animation-slideOut');

            this.isShow = false;
        }
    });

    return TimeSelecter;
});
