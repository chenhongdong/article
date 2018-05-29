let Event = function () {
    let self = this,
        Event,
        _default = 'default';

    Event = function () {
        let _listen,
            _trigger,
            _remove,
            _slice = Array.prototype.slice,
            _shift = Array.prototype.shift,
            _unshift = Array.prototype.unshift,
            spaceCache = {},
            _create,
            find,
            each = function (arr, fn) {
                let res;
                for (let i = 0, l = arr.length; i < l; i++) {
                    let n = arr[i];
                    res = fn.call(n, i, n);
                }
                return res;
            };

        _listen = function (key, fn, cache) {
            if (!cache[key]) {
                cache[key] = [];
            }
            cache[key].push(fn);
        };

        _remove = function (key, cache, fn) {
            if (cache[key]) {
                if (fn) {
                    for (let i = cache[key].length; i >= 0; i--) {
                        if (cache[key][i] === fn) {
                            cache[key].splice(i, 1);
                        }
                    }
                } else {
                    cache[key] = [];
                }
            }
        };

        _trigger = function() {
            let cache = _shift.call(arguments),
                key = _shift.call(arguments),
                args = arguments,
                self = this,
                res,
                stack = cache[key];

            if (!stack || !stack.length) {
                return;
            }

            return each(stack, function() {
                return this.apply(self, args);
            });
        };

        _create = function(space = _default) {
            let cache = {},
                offlineStack = [],  // 离线事件
                res = {
                    listen(key, fn, last) {
                        _listen(key, fn, cache);
                        if (offlineStack === null) {
                            return;
                        }
                        if (last === 'last') {
                            offlineStack.length && offlineStack.pop()();
                        } else {
                            each(offlineStack, function() {
                                this();
                            });
                        }
                        offlineStack = null;
                    },
                    one(key, fn, last) {
                        _remove(key, cache);
                        this.listen(key, fn, last);
                    },
                    remove(key, fn) {
                        _remove(key, cache, fn);
                    },
                    trigger() {
                        let fn, args, self = this;

                        _unshift.call(arguments, cache);
                        args = arguments;
                        fn = function() {
                            return _trigger.apply(self, args);
                        };

                        if (offlineStack) {
                            return offlineStack.push(fn);
                        }
                        return fn();
                    }
                };

            return space ? (spaceCache[space] ? spaceCache[space] : spaceCache[space] = res) : res;
        };   

        return {
            create: _create,
            one(key, fn, last) {
                let event = this.create();
                event.one(key, fn, last);
            },
            remove(key, fn) {
                let event = this.create();
                event.remove(key, fn);
            },
            listen(key, fn, last) {
                let event = this.create();
                event.listen(key, fn, last);
            },
            trigger() {
                let event = this.create();
                event.trigger.apply(this, arguments);
            }
        }
    }

    return Event;
}
