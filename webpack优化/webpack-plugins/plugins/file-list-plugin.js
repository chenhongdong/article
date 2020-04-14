
class FileListPlugin {
    constructor({filename}) {
        this.filename = filename;
    }
    apply(compiler) {
        // 文件已经准备好了，要发射emit
        compiler.hooks.emit.tap('FileListPlugin', (compilation, cb) => {
            console.log(compilation.assets);
            let assets = compilation.assets;
            let content = `## 文件名    资源大小`;
            Object.entries(assets).forEach(([filename, statObj]) => {
                content += `\r\n- ${filename}    ${statObj.size()}`
            });
            // 资源对象
            assets[this.filename] = {
                source() {
                    return content;
                },
                size() {
                    return content.length;
                }
            }
        })
    }
}

module.exports = FileListPlugin;