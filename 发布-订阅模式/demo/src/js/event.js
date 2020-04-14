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
            fns = this.list[key];

        if (!fns || fns.length === 0) {
            return false;
        }
        for (let i = 0; i < fns.length; i++) {
            fns[i].apply(this, arguments);
        }
    },
    remove(key, fn) {
        let fns = this.list[key];

        if (!fns) {
            return false;
        }
        if (!fn) {
            fns && (fns.length = 0);
        } else {
            for (let i = fns.length - 1; i >= 0; i--) {
                if (fns[i] === fn) {
                    fns.splice(i, 1);
                }
            }
        }
    }
};

export default event;