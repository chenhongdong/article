## webpack打包后的文件解析
- 是自己实现了一个require方法，`__webpack_require__`
- 默认会引用主文件
    - 确定入口文件
- 会在文件执行的时候传入key和value
    - key是文件的相对路径
    - value是对应文件的代码块
    - 文件的依赖关系

## pack打包
新建一个新的文件夹pack，用来实现webpack打包功能的

执行命令，如果想在node里配置一个命令行工具，就需要在`package.json`里配置`bin`属性
```
{
    "bin": {
        "pack": "./bin/pack.js"
    }
}
```
`#! /usr/bin/env node`指定代码在node环境下运行

连接到全局指令`npm link`

当前项目下映射到本地`npm link pack`

### 确定配置文件
需要找到当前执行命令的路径，拿到`webpack.config.js`

通过path拿到config文件
```
// bin/pack.js文件

let config = require(path.resolve('webpack.config.js'));

```

### Compiler编译执行

#### parse进行AST语法树解析
- babylon 主要就是把源码转化成AST
- @babel/traverse 遍历对应的节点
- @babel/types  替换遍历好的节点
- @babel/generator

### plugins
tapable库可以实现发布订阅