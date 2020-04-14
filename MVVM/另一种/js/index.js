/*
        创建Vue构造函数
        传入自定义参数
        数据data,方法methods还有mounted钩子函数
        传入属性值到proxyKeys函数，方便进行读写
        调用观察者和编译
    */
   function Vue(options) {
    var self = this;
    this.data = options.data;
    this.methods = options.methods;
    
    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key);
    });
    
    observe(this.data);
    new Compile(options.el, this);
    // 所有事情处理好后执行mounted钩子函数
    options.mounted.call(this);     
}

Vue.prototype = {
    proxyKeys: function(key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,  // 不可枚举
            configurable: true, // 可以修改删除
            get: function() {
                return self.data[key];
            },
            set: function(newVal) {
                self.data[key] = newVal;
            }
        });
    }
};