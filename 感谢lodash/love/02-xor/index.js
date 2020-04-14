// 类型tag
const funcTag = '[object Function]';
const objToString = Object.prototype.toString;


function isArrayLikeObject(val) {
    return isObjectLike(val) && isArrayLike(val);
}
// 检测类对象
function isObjectLike(val) {
    return val !== null && typeof val === 'object';
}
// 检测类数组
function isArrayLike(val) {
    return val !== null && isLength(val.length) && !isFunction(val);
}
// 检测对象
function isObject(val) {
    const type = typeof val;
    return val !== null && (type === 'object' || type === 'function');
}
// 检测函数
function isFunction(val) {
    if (!isObject(val)) {
        return false;
    }
    const tag = objToString.call(val);
    return tag === funcTag;
}
// 检测数组长度
function isLength(val) {
    return typeof val === 'number' && val % 1 === 0;
}


function arrayFilter(arr, predicate) {
    let index = -1,
        len = arr === null ? 0 : arr.length,
        result = [];
    
    while (++index < len) {
        let val = arr[index];
        if (predicate(val, index, arr)) {
            result.push(val);
        }
    }

    return result;
}

let arr = [[1, 2], [1, 3]];
console.log(arrayFilter(arr, isArrayLikeObject))


setTimeout(() => {
    console.log('timeout')
}, 0);

isArrayLike(function(){})
