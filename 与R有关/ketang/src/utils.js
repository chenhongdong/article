// ele 要实现此功能DOM对象  cb加载更多的方法
export function loadMore(ele, cb) {
    let timer;

    ele.addEventListener('scroll', () => {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
            let clientHeight = ele.clientHeight;    // 可视区高度
            let scrollTop = ele.scrollTop;          // 滚动高度
            let scrollHeight = ele.scrollHeight;    // 内容高度

            if (clientHeight + scrollTop + 50 > scrollHeight) {
                cb();
            }
        }, 300);
    });
}
// 下拉刷新
export function downRefresh(ele, cb) {
    let startY;     // 刚按下的时候初始坐标
    let distance;   // 下拉的距离
    let originTop = ele.offsetTop;  // 最初父级距离顶部的距离

    ele.addEventListener('touchstart', (event) => {
        if (ele.offsetTop === originTop && ele.scrollTop === 0) {
            startY = event.touches[0].pageY;

            ele.addEventListener('touchmove', touchMove);
            ele.addEventListener('touchend', touchEnd);
        }
        

        function touchMove(event) {
            let pageY = event.touches[0].pageY;
            // 如果越来越大，表示下拉
            if (pageY > startY) {
                distance = pageY - startY;
                ele.style.top = originTop + distance + 'px';
            } else {
                ele.removeEventListener('touchmove', touchMove);
                ele.removeEventListener('touchend', touchEnd);
            }
        }

        function touchEnd() {
            ele.removeEventListener('touchmove', touchMove);
            ele.removeEventListener('touchend', touchEnd);

            // 每隔13毫秒做一次回弹
            let timer = setInterval(() => {
                if (distance < 1) {
                    distance = 0;
                    clearInterval(timer);
                } else {
                    --distance;
                }
                ele.style.top = originTop + distance + 'px';
            }, 13);


            if (distance > 30) {
                cb();
            }
        }
    });
}