function EventEmitter() {
    this.events = Object
}
EventEmitter.prototype.on = function(type, cb) {
    if (!this.events) {
        this.events = Object.create(null);  // 保证原型链没有继承其他东西
    }
    if (this.events[type]) {
        this.events[type].push(cb);
    } else {  // 内存没有放过
        this.events[type] = [cb];
    }
};
EventEmitter.prototype.emit = function(type) {
    if (this.events[type]) {
        this.events[type].forEach(listener => {
            listener.call(this);
        });
    }
};
EventEmitter.prototype.once = function(type, cb) {
    function wrap() {
        cb();
        this.removeListener(type, wrap);
    }
    this.on(type, wrap);
};
EventEmitter.prototype.removeListener = function(type, cb) {
    if (this.events[type]) {
        this.events[type].filter(listenner => {
            return cb !== listenner;
        })
    }
};
module.exports = EventEmitter;