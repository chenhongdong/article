## 安装webpack
npm i webpack webpack-cli -D

## webpack是基于Node的
创建一个webpack.config.js文件来配置webpack
```
module.exports = {
    entry:{},               // 入口文件
    output:{},              // 出口文件
    module:{},              // 处理对应模块
    plugins:[],             // 插件
    devServer:{},           // 开发服务器配置
    mode: 'development'     // 打包的模式
}
```
devServer需要安装webpack-dev-Server
npm i webpack-dev-Server -D

## 配置Html模板
npm i html-webpack-plugin -D
因为是个插件，所以需要在config.js里引用
```
let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'main.[hash:4].js',   // 添加hash可以防止文件缓存，每次都会生成4位的hash串
        path: path.resolve('dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            hash: true
        })
    ]
}
```
## 引入CSS/LESS文件
可以在src/index.js里引入css文件，到时候直接打包到生产目录下
需要下载一些解析css样式的loader 
npm i style-loader css-loader -D
引入less文件的话，也需要安装对应的loader
npm i less less-loader -D
```
// index.js
import './css/style.css';
import './less/style.less';

console.log('这里是打包文件入口-index.js');

// webpack.config.js
module.exports = {
    entry: {
        index: './src/index.js'
    },
    output: {
        filename: 'main.js',
        path: path.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,     // 解析css
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,    // 解析less
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    }
}
```
此时打包后的css文件是以行内样式style的标签写进页面的，如果样式很多的话，我们想直接用link引入的方式
这时候需要把css拆分出来
npm i extract-text-webpack-plugin -D
```
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filaneme: 'main.js',
        path: path.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextWebpackPlugin({
                    use: 'css-loader'       // 将css用link的方式引入就不再需要style-loader了
                })
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new ExtractTextWebpackPlugin('css/style.css')   // 拆分后会把css文件放到dist目录下的css/style.css
    ]
}
```

## 启动静态服务器
默认自动刷新
```
module.exports = {
    devServer: {
        contentBase: './dist',
        host: 'localhost',      // 默认是localhost
        port: 3000,             // 端口
        open: true,             // 自动打开浏览器
        hot: true               // 开启热更新
    }
}
```

## 热更新和热刷新的区别
if (module.hot) {
    module.hot.accept();    // 开启热更新
}
不过如果将css样式拆分后就失效了，解决这个问题的方法就是通过环境变量来判断
new ExtractTextWebpackPlugin({
    filename: 'css/style.css',
    disable: isDev
})

## 编译ES6
npm i babel-core babel-loader babel-preset-env babel-prese-stage-0 -D
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader'
            }
        ]
    }
}
```

## resolve

## optimization

## DllPlugin
动态链接库  写代码时 会编译很多包 我们有很多的第三方包
先打好包