import baseFlatten from './baseFlatten';

const INFINITY = 1 / 0;

function flattenDeep(arr) {
    let len = arr === null ? 0 : arr.length;
    return len ? baseFlatten(arr, INFINITY) : [];
}

export default flattenDeep;