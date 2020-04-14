const isArray = Array.isArray;

// 依赖基础展平方法baseFlatten
function baseFlatten(arr, depth, isStrict, result = []) {
    let index = -1,
        len = arr.length;

    while (++index < len) {
        let val = arr[index];
        if (depth > 0 && isArray(val)) {
            if (depth > 1) {
                baseFlatten(val, depth - 1, isStrict, result);
            } else {
                // 这里是如果没有多层数组展开的时候就需要通过arrayPush方法
                // 来把数组里多维数组里的第一层直接添加到新数组的后面
                //  [1, 2, [3, 4, [5, 6]]] => [1, 2, 3, 4, [5, 6]]
                arrayPush(result, val);
            }
        } else if (!isStrict) {
            // 这里是不包含在多维数组中的值，直接一个一个放进去就好
            result.push(val);
        }
    }

    return result;
}

function arrayPush(arr, multiArr) {
    // arr => [1, 2, [3, 4, [5, 6]]]
    let index = -1,
        len = multiArr.length,  // 3 多维数组里的length, val => [3, 4, [5, 6]]
        offset = arr.length;    // 2

    while (++index < len) {
        arr[offset + index] = multiArr[index];
        /* 
            arr[2] = [3, 4, [5, 6]][0] = 3
            arr[3] = [3, 4, [5, 6]][1] = 4
            arr[4] = [3, 4, [5, 6]][2] = [5, 6]
        */
    }

    return arr;
}

export default baseFlatten;