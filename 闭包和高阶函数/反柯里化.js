Function.prototype.uncurrying = function() {
    let self = this;
    return function() {
        let obj = Array.prototype.shift.call(arguments);
        return self.apply(obj, arguments);
    }
};