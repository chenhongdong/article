class AsyncPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('AsyncPlugin', (compilation, cb) => {
            setTimeout(() => {
                console.log('文件发射了， 等一下');
                cb();
            }, 1000);
        });
        compiler.hooks.emit.tapPromise('AsyncPlugin', (compilation) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('再等两秒');
                    resolve();
                }, 2000);
            });
        });
    }
}

module.exports = AsyncPlugin;