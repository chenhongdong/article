import baseFlatten from './baseFlatten';

function flatten(arr) {
    let len = arr === null ? 0 : arr.length;
    return len ? baseFlatten(arr, 1) : [];
}


export default flatten;