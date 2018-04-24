/*
let arr = [7, 9, 8];
quickSort
    // 递归
    quick([7, 9, 8], 0, 2)  // 传递开头和末尾，两个位置
    index   // 用来分离小值数组和大值数组，一左一右
    length > 1
        对子数组进行划分，第一次传入的是原数组[7, 9, 8]

        partition(arr, left, right) 用来划分位置
        point = [7, 9, 8][Math.floor(0+2)/2] -> 9
        i -> 0, j -> 2    
        // i 和 j 其实就是双指针，一个从左开始，一个从右开始

        while (i <= j) { 0 <= 2
            // 第一次 7 < 9
            // 下一次 arr[1] -> 9  9 < 9不成立
            while (arr[i] < 9) { 
                i++;    i -> 1
            }
            // arr[2] -> 8 > 9不成立
            while (arr[j] > 9) {
                j--;
            }
            // 此时i->1, j->2
            if (i <= j) {   1 <= 2
                // 交换位置
                [arr[i], arr[j]] = [arr[2], arr[1]] -> [8, 9]
                i++;    i -> 2
                j--;
            }
            // 划分重排后的数组为[7, 8, 9]
            return i; 返回划分的坐标i -> 2
        }

        此时计算出了index为2
        if (left < index - 1) { 0 < 2-1
            // 继续递归
            quick([7, 8, 9], 0, 1);
            // 这步递归完后，index->1,right->-1
        }
        if (index < right) {
            quick([7,8,9], 2, 3);
        }
    按照以上步骤继续推到即可理解了，加油加油
*/