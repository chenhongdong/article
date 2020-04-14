/*
    Set的属性size
    操作方法：
        add
        delete
        has
        clear
    遍历方法：
        keys
        values
        entries

    add(value):向集合添加一个新的项
    delete(value):从集合中移除一个值
    has(value):如果值在集合中存在，返回true,否则false
    clear(): 移除集合里所有的项
    size():返回集合所包含元素的数量
    values():返回一个包含集合中所有值的数组
*/
function Set(arr = []) {
    let items = {};
    this.size = 0;
    // has方法
    this.has = function (val) {
        return items.hasOwnProperty(val);
    };
    // add方法
    this.add = function (val) {
        // 如果没有存在items里面就可以直接写入
        if (!this.has(val)) {
            items[val] = val;
            this.size++;
            return true;
        }
        return false;
    };
    arr.forEach((val, i) => {
        this.add(val);
    });
    // delete方法
    this.delete = function (val) {
        if (this.has(val)) {
            delete items[val];  // 将items对象上的属性删掉
            this.size--;
            return true;
        }
        return false;
    };
    // clear方法
    this.clear = function () {
        items = {};
        this.size = 0;
    };
    // keys方法
    this.keys = function () {
        return Object.keys(items);
    };
    // values方法
    this.values = function () {
        return Object.values(items);
    }
    // forEach方法
    this.forEach = function (fn, context) {
        for (let i = 0; i < this.size; i++) {
            let item = Object.keys(items)[i]
            fn.call(context, item, item, items);
        }
    }

    // 除此之外，Set还可以实现并集(union),交集(intersect),差集(difference)和子集(subset)
    // 并集
    this.union = function (other) {
        let union = new Set();
        let values = this.values();

        for (let i = 0; i < values.length; i++) {
            union.add(values[i]);
        }
        values = other.values();    // 将values重新赋值为新的集合
        for (let i = 0; i < values.length; i++) {
            union.add(values[i]);
        }

        return union;
    };
    // 交集
    this.intersect = function (other) {
        let intersect = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (other.has(values[i])) {
                intersect.add(values[i]);
            }
        }
        return intersect;
    };
    // 差集
    this.difference = function (other) {
        let difference = new Set();
        let values = this.values();
        for (let i = 0; i < values.length; i++) {
            if (!other.has(values[i])) {
                difference.add(values[i]);
            }
        }
        return difference;
    };
    // 子集
    this.subset = function(other) {
        if (this.size > other.size) {
            return false;
        } else {
            let values = this.values();
            for (let i = 0; i < values.length; i++) {
                console.log(values[i])
                console.log(other.values())
                if (!other.has(values[i])) {
                    return false;
                }
            }
            return true;
        }
    };
}

module.exports = Set;