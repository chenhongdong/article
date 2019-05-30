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
    isFunction(val);
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
    const tag = 
    console.log(Object.prototype.toString.call(val));
}

isArrayLike(function(){})
