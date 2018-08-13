let Event = (function () {
    let list = {},
        listen,
        trigger,
        remove;

    listen = function (key, fn) {
        if (!list[key]) {
            list[key] = [];
        }
        list[key].push(fn);
    };

    trigger = function () {
        let key = [].shift.call(arguments),
            fns = list[key],
            len = fns.length;

        if (!fns || len === 0) {
            return false;
        }
        for (let i = 0; i < len; i++) {
            fns[i].apply(this, arguments);
        }
    };

    remove = function (key, fn) {
        let fns = list[key];

        if (!fns) return false;

        if (!fn) {
            fns && (fns.length = 0);
        } else {
            for (let i = fns.length - 1; i >= 0; i--) {
                let _fn = fns[i];
                if (_fn === fn) {
                    fns.splice(i, 1);
                }
            }
        }
    };


    return {
        listen,
        trigger,
        remove
    };
})();


