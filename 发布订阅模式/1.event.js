let Event = {
    list: [],
    on(key, fn) {
        if (!this.list[key]) {
            this.list[key] = [];
        }
        this.list[key].push(fn);
    },
    emit() {
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

        if (!fns) return false;

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

function play() {
    console.log('玩游戏');
}
function study() {
    console.log('学习');
}

// Event.remove('smile', study);
Event.on('smile', play);
Event.on('smile', study);