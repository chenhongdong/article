/*
    构造函数
        el: 父元素dom
        vm: vue实例
        fragment: 代码碎片
        执行init()
    */
   function Compile(el, vm) {
    this.el = document.querySelector(el);
    this.vm = vm;
    this.fragment = null;
    this.init();
}

//在原型上添加方法
Compile.prototype = {
    /*
        初始化执行，
        将节点转成文档碎片
        再将文档碎片进行编译
        最后将编译后的文档碎片添加到el里
    */
    init: function() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('DOM元素不存在');
        }
    },
    /*
        创建文档碎片
        通过传入的el找到第一个子节点
        迭代子节点，将子节点依次加入到文档碎片
        返回文档碎片
    */
    nodeToFragment: function(el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        
        while (child) {
            // 将DOM元素添加到fragment中
            fragment.appendChild(child);    
            child = el.firstChild;
        }
        
        return fragment;
    },
    /*
        获取el下面所有节点childNodes -> child
        将child转为数组然后进行遍历
        正则匹配{{}}的模板字符串
        通过textContent获得所有的文本内容,textContent性能会好些，使用它可以防止XSS攻击
        判断是否为DOM节点   是： compile编译dom
        判断是否为文本节点&&是否正则匹配  是： compileText编译文本
        判断遍历的元素是否还有子节点 是： 递归compileElement继续编译
    */
    compileElement: function(el) {
        var self = this;
        var childNodes = el.childNodes;
        
        [].slice.call(childNodes).forEach(function(node) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent
            
            if ( self.isElementNode(node) ) {
                self.compile(node);
            } else if ( self.isTextNode(node) && reg.test(text) ) {
                self.compileText( node, reg.exec(text)[1] );
            }
            
            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    },
    /*
        获取该元素的所有属性集合
        遍历属性集合，取得属性名attr.name
        通过attrName判断是否为v-开头的属性
        声明exp为属性值
        取v-之后的字符用以判断属性类型是事件还是model     (v-model或v-on:click)
        如果是事件类型  compileEvent编译事件
        如果是model类型 compileModel编译model
        最后去掉元素上的属性
    */
    compile: function(node) {
        var self = this;
        var nodeAttrs = node.attributes;
        
        Array.prototype.forEach(function(attr) {
            var attrName = attr.name;
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {
                    self.compileEvent(node, self.vm, exp, dir);
                } else {
                    self.compileModel(node, self.vm, exp, dir);
                }
            }
        });
    },
    /*
        通过传的dir参数来获取事件类型
        声明变量cb，通过exp得到methods中的对应方法
        给元素添加事件,cb的this绑定为vue实例上
    */
    compileEvent: function(node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];
        
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    /*
        声明val为实例的exp
        调用modelUpdater方法更新
        使用new Watcher去监听exp的变化然后再次调用modelUpdater方法进行更新
        给元素添加事件，去比较新旧值的变化，替换vm里的值
    */
    compileModel: function(node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        
        this.modelUpdater(node, val);
        
        new Watcher(this.vm, exp, function(value){
            self.modelUpdater(node, value);
        });
        
        node.addEventListener('input', function(e) {
            var newVal = e.target.value;
            
            if (val === newVal) {
                return;
            }
            
            self.vm[exp] = newVal;
            val = newVal;
        });
    },
    modelUpdater: function(node, value, oldVal) {
        node.value = typeof value === 'undefined' ? '' : value;
    },
    /*
        获取实例上的内容
        调用updateText方法设置元素的文本值
        new Watcher监听变化，调用updateText重新赋值
    */
    compileText: function(node, exp) {
        var self = this;
        var initText = this.vm[exp];
        
        this.updateText(node, initText);
        new Watcher(this.vm, exp, function(value){
            self.updateText(node, value); 
        });
    },
    updateText: function(node, value) {
        node.textContent = typeof value === 'undefined' ? '' : value;
    },
    isDirective: function(attr) {
        return attr.indexOf('v-') === 0;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on:') === 0;  
    },
    isElementNode: function(node) {
        return node.nodeType === 1;
    },
    isTextNode: function(node) {
        return node.nodeType === 3;
    }
};