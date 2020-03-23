// 全局指令

// 指令是一个方法，也有自己的生命周期
export default (Vue) => {
    Vue.directive('click-outside', {
        inserted(el, binding) {
            document.addEventListener('click', (e) => {
                if (e.target === el || el.contains(e.target)) {
                    return;
                }
                binding.value();    // value就是指令=号的值
            });
        }
    })
    // Vue.directive('focus', {
    //     // 当被绑定的元素插入到 DOM 中时……
    //     inserted: function (el) {
    //       // 聚焦元素
    //       el.focus()
    //     }
    // })
}