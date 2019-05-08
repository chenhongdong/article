import { flatten, flattenDeep, flattenDepth } from './01-flatten';

let demo = [3, 1, [4, 1, [5, 9, [2, 6]]]];

console.log(flattenDeep(demo));
