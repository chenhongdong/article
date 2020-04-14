
function throttle (fn, wait) {
    let _fn = fn,       // 保存需要被延迟的函数引用
        timer,          
        flags = true;   // 是否首次调用

    return function() {
        let args = arguments,
            self = this;

        console.log(_fn);
        console.log(fn);
        if (flags) {    // 如果是第一次调用不用延迟，直接执行即可
            _fn.apply(self, args);
            flags = false;
            return flags;
        }
        // 如果定时器还在，说明上一次还没执行完，不往下执行
        if (timer) return false;
            
        timer = setTimeout(function() { // 延迟执行
            clearTimeout(timer);    // 清空上次的定时器
            timer = null;           // 销毁变量
            console.log(fn);
            _fn.apply(self, args);
        }, wait);
    }
}


window.onscroll = throttle(function() {
    console.log('滚动');
}, 500);


let arr = [];

for (let i = 0; i < 100000; i++) {
    arr.push(i);
}

function render(data) {
    for (let i = 0; i < data.length; i++) {
        let div = document.createElement('div');
        div.innerHTML = i;
        document.body.appendChild(div);
    }
}

// render();

let render2 = timeChunk(arr, function(n) {
    let div = document.createElement('div');
    div.innerHTML = n;
    document.body.appendChild(div);
}, 8, 30);

// render2();

function timeChunk(data, fn, count = 1, wait) {
    let obj, timer;

    function start() {
        let len = Math.min(count, data.length);
        for (let i = 0; i < len; i++) {
            val = data.shift();
            fn(val);
        }
    }

    return function() {
        timer = setInterval(function() {
            if (data.length === 0) {    // 如果数据为空了，就清空定时器
                return clearInterval(timer);
            }
            start();
        }, wait);
    }
}



// 普通实现
// let addEvent = function(ele, type, fn) {
//     if (window.addEventListener) {
//         return ele.addEventListener(type, fn, false);
//     } else if (window.attachEvent) {
//         return ele.attachEvent('on' + type, function() {
//             fn.call(ele);
//         });
//     }
// }

// 惰性加载
let addEvent = function(ele, type, fn) {
    if (window.addEventListener) {
        addEvent = function(ele, type, fn) {
            ele.addEventListener(type, fn, false);
        }
    } else  if (window.attachEvent) {
        addEvent = function(ele, type, fn) {
            ele.attachEvent('on' + type, function() {
                fn.call(ele)
            });
        }
    }

    addEvent(ele, type, fn);
};

let div = document.getElementById('box');

addEvent(div, 'click', function() {
    alert(1);
});

addEvent(div, 'click', function() {
    alert(2);
});

let obj = {
    name: '周杰伦'
};

function fn() {
    console.log(this.name);
}

let name = fn.bind(obj);
name(); 

Function.prototype.bind = function(context) {
    let self = this,
        slice = Array.prototype.slice,
        args = slice.call(arguments);
        
    return function() {
        return self.apply(context, args.slice(1));    
    }
};


let single = function (fn) {
    let ret;
    return function () {
        return ret || (ret = fn.apply(this, arguments));
    }
};

let bindEvent = single(function () {
    // 虽然下面的renders函数执行3次，bindEvent也执行了3次
    // 但是根据单例模式的特点，box上绑定的click事件只绑定了1次
    document.getElementById('box').onclick = function() {
        alert('click');
    }
    return true;
});

let renders = function() {
    console.log('渲染');
    bindEvent();
    bindEvent();    
}

renders();
renders();
renders();


function curry(fn) {
    const g = (...allArgs) => allArgs.length >= fn.length ?
        fn(...allArgs) : 
        (...args) => g(...allArgs, ...args)

    return g;
}


function curry(fn) {
    let slice = Array.prototype.slice,  // 将slice缓存起来
        args = slice.call(arguments, 1);   // 这里将arguments转成数组并保存
        
    return function() {
        // 将新旧的参数拼接起来
        let newArgs = args.concat(slice.call(arguments));    
        // console.log(newArgs)
        return fn.apply(null, newArgs); // 返回执行的fn并传递最新的参数
    }
}

curry(function(a, b) {
    console.log(a, b);
}, 1,2,3,4,5)(6,7,8,9);