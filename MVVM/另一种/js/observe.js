/*
        创建构造函数Observer
        执行walk()
    */
   function Observer(data) {
    this.data = data;
    this.walk(data);
}

// 添加到原型上的方法
Observer.prototype = {
    /*
        遍历data的key
        重新定义属性
    */
    walk: function(data) {
        var self = this;
        Object.keys(data).forEach(function(key) {
            self.defineReactive(data, key, data[key]); 
        });
    },
    /*
        new Dep
        defineProperty
    */
    defineReactive: function(data, key, val) {
        var dep = new Dep();
        
        Object.defineProperty(data, key, {
            enumerable: false,
            configurable: false,
            get: function getter() {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: function setter(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify();
            }
        })
    }
};
// 观察者函数
function observe(val, vm) {
    if (!val || typeof val !== 'object') {
        return;
    }
    return new Observer(val);
}

function Dep() {
    this.subs = [];
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    notify: function() {
        this.subs.forEach(function(sub){
            sub.update();
        }); 
    }
};
Dep.target = null;