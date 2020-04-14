// 发布订阅模式     订阅  在有发布 [fn1, fn2, fn3]

function Dep() {
    // 事件池,一个数组
    this.subs = [];
}
Dep.prototype.addSub = function(sub) {
    this.subs.push(sub);
};
// 绑定的方法   都有一个update
Dep.prototype.notify = function() {
    this.subs.forEach(sub => sub.update());
};


function Watcher(fn) {  // 通过这个类创建的实例，都拥有update方法
    // 将fn放到实例上
    this.fn = fn;
}
Watcher.prototype.update = function() {
    this.fn();
};

let watcher = new Watcher(function() {  // 监听函数
    console.log('订阅了');
});

let dep = new Dep();
dep.addSub(watcher);    // 将watcher放到了数组中    => [watcher.update]
dep.addSub(watcher);
console.log(dep.subs);


dep.notify();   // 主要靠的就是数组关系，订阅就是放入函数，发布就是让数组里的函数执行