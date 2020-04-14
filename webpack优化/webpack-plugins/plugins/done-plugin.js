// 这是一个同步插件
// class DonePlugin {
//     apply(compiler) {   // complier.hooks
//         // 第一个参数写插件的名字就行
//         // 第二个参数是回调
        
//         compiler.hooks.done.tap('DonePlugin', (stats) => {
//             console.log('编译完成');
//         });
//     }
// }

class DonePlugin {
    apply(compiler) {   // copiler.hooks
        compiler.hooks.done.tap('DonePlugin', (stats) => {
            console.log('编译完成~~~', stats);
        });
    }
}

module.exports = DonePlugin;