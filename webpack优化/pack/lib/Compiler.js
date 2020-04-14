const path = require('path');
const fs = require('fs');

const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const generator = require('@babel/generator').default;

const ejs = require('ejs');

const { SyncHook } = require('tapable');

class Compiler {
    constructor(config) {
        this.config = config;
        // 第一步：需要保存入口文件的路径
        this.entryId;   // ./src/index.js
        // 第二步：需要保存所有模块的依赖
        this.modules = {};
        // 入口路径
        this.entry = config.entry;
        // 工作路径
        this.root = process.cwd();
        // hooks
        this.hooks = {
            entryOption: new SyncHook(),
            compile: new SyncHook(),
            afterCompile: new SyncHook(),
            afterPlugins: new SyncHook(),
            run: new SyncHook(),
            emit: new SyncHook(),
            done: new SyncHook()
        };

        // 如果传递了plugins参数
        let plugins = this.config.plugins;
        if (Array.isArray(plugins)) {
            plugins.forEach(plugin => {
                plugin.apply(this);
            });
        }
        this.hooks.afterPlugins.call();
    }
    getSource(path) {   // ./style.less
        let content = fs.readFileSync(path, 'utf8');
        let rules = this.config.module.rules;
        // 拿到每个规则来处理
        rules.forEach(rule => {
            let { test, use } = rule;
            let len = use.length - 1;
            if (test.test(path)) {  // 这个模块需要通过loader来转化
                function normalLoader() {
                    // 获取对应的loader函数
                    let loader = require(use[len--]);
                    // 递归调用loader，实现转化功能
                    content = loader(content);

                    if (len >= 0) {
                        normalLoader();
                    }
                }
                normalLoader();
            }
        })
        return content;
    }
    parse(source, dirPath) {    // AST语法树解析

        let ast = babylon.parse(source);
        // 依赖的数组
        let dependencies = [];

        traverse(ast, {
            CallExpression(p) {
                let node = p.node;  // 对应的节点
                if (node.callee.name === 'require') {
                    node.callee.name = '__webpack_require__';
                    // 取到了模块的引用名字
                    let moduleId = node.arguments[0].value;
                    // 添加文件的后缀名
                    moduleId = moduleId + (path.extname(moduleId) ? '' : '.js');
                    moduleId = './' + path.join(dirPath, moduleId);
                    dependencies.push(moduleId);
                    // 修改源码
                    node.arguments = [t.stringLiteral(moduleId)];
                }
            }
        });

        // 生成转换后的ast
        let sourceCode = generator(ast).code;
        return { sourceCode, dependencies };
    }
    buildModule(modulePath, isEntry) {
        // 拿到文件的内容
        let source = this.getSource(modulePath);
        // 拿到模块的id   './src/a.js'这些是相对路径
        // 需要用总路径modulePath - 工作路径this.root得到
        let moduleId = './' + path.relative(this.root, modulePath);

        if (isEntry) {
            this.entryId = moduleId;    // 保存入口的名字
        }
        // 解析需要把=修改source源码，并且返回一个依赖的列表
        let { sourceCode, dependencies } = this.parse(source, path.dirname(moduleId));

        // 把相对路径和模块中的内容对应起来
        this.modules[moduleId] = sourceCode;
        // 递归所有的依赖项
        dependencies.forEach(dep => {
            // 拼出一个绝对路径
            this.buildModule(path.join(this.root, dep), false);
        })
    }
    // 发射文件
    emitFile() {
        // 用数据渲染我们的模板
        // 先拿到输出目录
        let main = path.join(this.config.output.path, this.config.output.filename);
        let tempStr = this.getSource(path.join(__dirname, 'temp.ejs')); // 读取的是模板路径
        // 渲染模板字符串,传入需要的数据
        let code = ejs.render(tempStr, { entryId: this.entryId, modules: this.modules });
        // 资源
        this.assets = {};
        // 资源中路径对应的代码
        this.assets[main] = code;
        // 写入输出目录
        fs.writeFileSync(main, this.assets[main]);
    }
    run() {
        this.hooks.run.call();

        this.hooks.compile.call();
        // 执行： 解析当前文件的依赖
        // 创建模块的依赖关系
        // 根据路径和文件的名字，读取出当前文件的内容
        this.buildModule(path.resolve(this.root, this.entry), true);    // true为主模块

        this.hooks.afterCompile.call();
        // 发射一个文件(打包后的文件)
        this.emitFile();
        this.hooks.emit.call();
        this.hooks.done.call();
    }
}

module.exports = Compiler;