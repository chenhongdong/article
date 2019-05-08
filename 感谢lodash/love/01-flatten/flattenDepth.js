import baseFlatten from './baseFlatten';

function flattenDepth(arr, depth = 1) {
    let len = arr === null ? 0 : arr.length;
    if (!len) {
        return [];
    }

    return baseFlatten(arr, Number(depth));
}

export default flattenDepth;