function Mvvm(options = {}) {
    this.$options = options;    // 将所有属性挂载到了$options，实际意义不大，这里是和vue一样
    // _data
    let data = this._data = this.$options.data;

    observe(data);
    // for (let key in data) {     // 这里实现数据代理到this上，可以直接通过this.singer拿到
    //     Object.defineProperty(this, key, {
    //         get() {
    //             return this._data[key];
    //         },
    //         set(newVal) {
    //             this._data[key] = newVal;
    //         }
    //     });
    // }

    // new Compare(options.el, this);
}
/// vm.$options
// observe 观察对象,给对象增加ObjectDefineProperty

function Observer(data) {   // 在这里实现我们主要的逻辑，写在外面方便用来递归
    for (let key in data) { // 把data属性通过Object.defineProperty的方式定义
        let val = data[key];
        observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            get() {
                return val;
            },
            set(newVal) {
                if (newVal === val) {   // 设置的值和以前值一样就不理它
                    return;
                }
                val = newVal;   // 如果以后再获取值的时候，将刚才设置的值再返回去
                oberver(newVal);    // 当设置为新值后，也需要把新值再去定义成属性
            }
        });
    }

}

function observe(data) {
    if (!data || typeof data !== 'object') return;
    return new Observer(data);
}


function Compare(el, vm) {
    vm.$el = document.querySelector(el);
    let fragment = document.createDocumentFragment();

    while (child = vm.$el.firstChild) {
        fragment.appendChild(child);
    }

    function replace(frag) {
        const childs = frag.childNodes;   // 是个类数组，用Array.from转成数组
        let reg = /\{\{(.*)\}\}/;

        Array.from(childs).forEach(function (node) {
            let txt = node.textContent;
            console.log(txt);
            // 文本节点判断的是在结构里没有被任何标签包含的情况
            if (node.nodeType === 3 && reg.test(txt)) {
                console.log(RegExp.$1)

                let arr = RegExp.$1.split('.');
                let val = vm;
                arr.forEach(function (key) {
                    val = val[key];
                });
                node.textContent = txt.replace(reg, val).trim();
            }
            if (node.nodeType === 1 && reg.test(txt)) {
            }
        });

    }
    replace(fragment);
    // 添加到元素中
    vm.$el.appendChild(fragment);
}


