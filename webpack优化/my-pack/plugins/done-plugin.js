class DonePlugin {
    apply(compiler) {
        console.log('插件');
        compiler.hooks.emit.tap('DonePlugin', () => {
            console.log('开始开始');

        });
    }
}
module.exports = DonePlugin;