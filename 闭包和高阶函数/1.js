function sum(x) {
    return function(y) {
        return x+y;
    }
}

let s1 = sum(20);
let s2 = s1(8);
console.log(s2);