// 创建一个数组列表来处理排序和搜索的数据结构
function ArrayList() {
    let arr = [];
    this.insert = function (item) {
        arr.push(item);
    };
    this.string = function () {
        return arr.join(' < ');
    };
    // 冒泡排序     眼熟？没错，面试里常考，而且它是排序算法中最简单的
    this.bubbleSort = function () {
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            // 这里之所以再－i，是因为外层循环已经跑完一轮，内循环就没有必要再比较一回了
            for (let j = 0; j < len - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {  // 当前项和下一项做比较，如果大于的话就像下面交换位置
                    // let tmp = arr[j];
                    // arr[j] = arr[j + 1];
                    // arr[j + 1] = tmp;
                    // ES6利用解构赋值的方式轻松实现j和j+1值的交换
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                }
            }
        }
    };
    // 选择排序
    this.selectSort = function () {
        let len = arr.length,
            min;

        for (let i = 0; i < len - 1; i++) {
            min = i;    // 我们取第一个值当标杆
            for (let j = i; j < len; j++) { // 内部循环从i开始到数组结束
                if (arr[min] > arr[j]) {    // 比标杆的值还小，就替换新值
                    min = j;
                }
            }
            if (i !== min) {    // 上面经过一顿比较替换，如果标杆的值和之前取的第一个值不同了，就交换位置
                [arr[i], arr[min]] = [arr[min], arr[i]];
            }
        }
    };
    // 插入排序
    this.insertSort = function () {
        let len = arr.length,
            num, tmp;
        // 这里默认第一项已经排序了，直接从第二项开始
        for (let i = 1; i < len; i++) {
            num = i;        // 用来记录一个索引 // 1
            tmp = arr[i];   // 储存一个临时变量，方便之后插入位置   // 1
            // 索引必须是大于0，并且数组前一项的值如果大于临时变量的值
            // 就将前一项的值赋给当期项，并且num--
            while (num > 0 && arr[num - 1] > tmp) { // 1>0 && 2 > 1
                arr[num] = arr[num - 1];    //arr[1] = 2
                num--;  // 0
            }
            arr[num] = tmp; // 最后在一顿替换后插入到了正确的位置上 // arr[0] = 1
        }
    };
    // 归并排序  采用的是一种分治算法 不明白分治算法？很简单，你就当做是二分法。之后会讲，就是将一个大问题拆成小问题来解决，等每个小问题都解决了，大问题也就搞定了
    // 思想：将原数组切分成小数组，直到每个数组只有一项，然后再将小数组合并成大数组，最后得到一个排好序的大数组

    this.mergeSort = function() {   
        arr = mergeRecurve(arr);    // 由于需要不停的拆分直到数组只有一项，所以使用递归来做
    };
    // 递归
    function mergeRecurve(arr) {
        let len = arr.length;
        if (len === 1) return arr;      // 递归的停止条件，如果数组只有一项，就直接返回了，这也是我们递归的目的，直到数组只有一项
        let mid = Math.floor(len / 2);
        let left = arr.slice(0, mid);
        let right = arr.slice(mid, len);    // 到这里把数组一分为二

        // 为了不断对原数组拆分，对left和right数组继续递归，并作为参数传给merge函数
        return merge(mergeRecurve(left), mergeRecurve(right));  // 这里用merge函数负责合并和排序小数组为大数组
    }
    function merge(left, right) {   // 接收两个数组，最后合并到一起返回一个大数组
        let res = [],
            lLen = left.length,
            rLen = right.length,
            l = 0,
            r = 0;

        while (l < lLen && r < rLen) {
            if (left[l] < right[r]) {   // 如果left数组的项比right数组的项小的话，就将left这里小的项添加到大数组里
                res.push(left[l++]);    // 并继续下一项比较
            } else {
                res.push(right[r++]);
            }
        }

        while (l < lLen) {
            res.push(left[l++]);
        }

        while (r < rLen) {
            res.push(right[r++]);
        }

        return res;
    }
}

let arr = [2, 1, 3, 11, 4, 7, 5];
let createList = function (arr) {
    let list = new ArrayList();
    for (let i = 0; i < arr.length; i++) {
        list.insert(arr[i]);
    }
    return list;
};
let item = createList(arr);
console.log(item.string());
item.mergeSort();
console.log(item.string());