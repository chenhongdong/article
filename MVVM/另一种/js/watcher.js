/*
        vm: vue实例
        exp: data里的key
        cb: 回调
        value: this.get()
    */
   function Watcher(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();    // 将自己添加到订阅器的操作
}

// 添加到原型上的方法
Watcher.prototype = {
    update: function() {
        this.run();
    },
    /*
        获取data上的key值和get后的老值对比
        如果不等的话就将老值重新赋值为新值
        将回调函数指向vm，传入新值和老值
    */
    run: function() {
        var value = this.vm.data[this.exp];
        var oldVal = this.value;
        if (value !== oldVal) {
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    /*
        需要缓存自己，释放自己
        通过data获得值，最后返回该值
    */
    get: function() {
        Dep.target = this;  // 缓存自己
        var value = this.vm.data[this.exp];
        Dep.target = null;
        return value;
    }
};