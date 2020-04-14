let event = {
    list: [],
    listen(key, fn) {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        this.list[key].push(fn);
    },
    trigger() {
        let key = [].shift.call(arguments),
            fns = this.list[key],
            len = fns.length;
        
        if (!fns || fns.length === 0) {
            return false;
        }
        for (let i = 0; i < len; i++) {
            fns[i].apply(this, arguments);
        }
    },
    remove(key, fn) {
        let fns = this.list[key];

        if (!fns) {
            return false;
        }
        // 如果没有传入具体的回调函数，则取消key对应消息的所有订阅
        if (!fn) {
            fns && (fns.length = 0);
        } else {
            for (let i = fns.length - 1; i >= 0; i--) {
                let _fn = fns[i];
                if (_fn === fn) {
                    fns.splice(i, 1);   // 删除订阅者的回调函数
                }
            }
        }
    }
};

let installEvent = function(obj) {
    for (let i in event) {
        obj[i] = event[i];
    }
};

// 测试用例
let pub = {};
installEvent(pub);
pub.listen('A', fn1 = function(foods, dinner) { // 小A
    console.log(`吃的是：${foods}`);
    console.log(`晚餐吃的是：${dinner}`);
});


pub.listen('B', fn2 = function(price, meter) { // 小B
    console.log(`价格=${price}`);
    console.log(`平米=${meter}`);
});

pub.listen('B', fn3 = function(drink, eat) {
    console.log(`喝了什么： ${drink}`);
    console.log(`吃的是： ${eat}`);
});

pub.remove('B', fn2);
pub.trigger('A', '薯条', '汉堡');
pub.trigger('B', '雪碧', '米线');