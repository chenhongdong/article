let num = 0;

document.getElementById('btn').onclick = function() {
    Event.trigger('add', num++);
};

Event.trigger('render', 'abc', [1,2,3]);

Event.on('render', function() {
    console.log(arguments);
})


// 发布 emit 订阅 on {}
function Girl() {
    this._events = {}
}
Girl.prototype.on = function (eventName,callback) {

    //这里判断他是不是第一次添加(订阅)
    if(this._events[eventName]){ 
        this._events[eventName].push(callback); 
    }else{
        this._events[eventName] = [callback]
    }
};
Girl.prototype.emit = function (eventName,...args) { 
    if(this._events[eventName]){
        this._events[eventName].forEach(cb=>cb(...args));
    }
};

let cry = (who) =>{console.log(who+'哭');};
let shopping = (who) =>{console.log(who+'购物');};
let eat = (who) =>{console.log(who+'吃');};
let smile=(who)=>{console.log(who+'笑')};

let girl1 = new Girl();
girl1.on('失恋',cry); 
girl1.on('失恋',eat);
girl1.on('失恋',shopping);
girl1.emit('失恋','小明');  

let girl2 = new Girl();
girl2.on('恋爱',shopping);
girl2.on('恋爱',smile);
girl2.emit('恋爱','小华');   