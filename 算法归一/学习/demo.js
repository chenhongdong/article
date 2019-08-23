/*
    1.分页计算
    在一个分页表格中，给定每页显示条数(pageSize)和元素的序号(index)，求页码？

    答案： const pageNo = Math.ceil((index + 1) / pageSize);
*/

/* 
    2.数组最大值
    const arr = [1,5,3,4,6];
    答案： const max = Math.max(...arr);
*/ 

/* 
    3.生成20-30之间的随机整数
    
    答案： Math.round(20 + Math.random() * 10);
*/

/* 
    4.判断一个数是否是素数（1和0不是素数，从2开始计算）

    答案： 
    function is_prime(n) {
        if (n <= 1) return;
        const N = Math.floor(Math.sqrt(n));
        let is_prime = true;
        for (let i = 2; i <= N; i++) {  // N^2 <= n <= (N+1)^2
            if (n % i === 0) {
                is_prime = false;
                break;
            }
        }
        return is_prime;
    }
*/

/* 
    5.括号匹配问题
    给定一个括号表达式，中间只有[]和()，判断这个表达式是两边括号是不是平衡的？
    比如[(())]是平衡的，[()(()]是不平衡的

    答案：
    function is_balance(str) {
        const [first, ...others] = str;
        const stack = [first];

        while (others.length > 0) {
            const c = stack[stack.length - 1];
            const n = others.shift();
            if (!match(n, c)) {
                stack.push(n);
            } else {
                stack.pop();
            }
        }
        return stack.length === 0;
    }

    function match(n, c) {
        return (c === '[' && n === ']') || (c === '(' && n === ')');
    }
*/

/* 
    6.数组去重
    答案： [...new Set(['a', 'b', 'a', 'c'])]
*/