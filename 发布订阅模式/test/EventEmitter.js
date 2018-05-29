class EventEmitter {
    constructor() {
        this.events = Object.create(null);
    }

    on(name, cb) {
        if (!this.events[name]) {
            this.events[name] = Object.create(null);
        } else {
            this.events[name] = [cb];
        }
    }

    emit(name) {
        if (this.events[name]) {
            this.events[name].forEach(listener => {
                listener.call(this, ...arguments);
            });
        }
    }
}

let cry = (who) =>{console.log(who+'哭');};
let shopping = (who) =>{console.log(who+'购物');};
let eat = (who) =>{console.log(who+'吃');};
let smile=(who)=>{console.log(who+'笑')};

let girl1 = new EventEmitter();
girl1.on('失恋',cry); 
girl1.on('失恋',eat);
girl1.on('失恋',shopping);
girl1.emit('失恋','小明');  

let girl2 = new EventEmitter();
girl2.on('恋爱',shopping);
girl2.on('恋爱',smile);
girl2.emit('恋爱','小华');  