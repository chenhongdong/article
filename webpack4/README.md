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

## 多入口文件
module.exports = {
    // 写成数组的形势就可以打出多入口文件，不过这里打包后的文件都合成了一个
    entry: ['./src/index.js', './src/login.js'],  
    // 真正实现多入口和多出口需要写成对象的形势
    entry: {
        index: './src/index.js',
        login: './src/login.js'
    }  
    output: {
        filename: 'bundle.js',
        // [name]就可以将出口文件名和入口文件名一一对应
        filename: '[name].js',      // index.js  login.js
        path: path.resolve('dist')
    }
}

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
- 此时打包后的css文件是以行内样式style的标签写进页面的，如果样式很多的话，我们想直接用link引入的方式
- 这时候需要把css拆分出来
extract-text-webpack-plugin插件相信用过的人都知道它是干什么的，它的功效就在于会将打包到js里的css文件进行一个拆分
npm i extract-text-webpack-plugin@next -D
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
## 引用图片
- 处理图片方面，也需要loader
```
npm i file-loader url-loader -D
```
如果是在css文件里引入的如背景图之类的图片，就需要指定一下相对路径

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextWebpackPlugin.extract({
                    use: 'css-loader',
                    publicPath: '../'
                })
            },
            {
                test: /\.(jpe?g|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,    // 小于8k的图片自动转成base64格式，并且不会存在实体图片
                            outputPath: 'images/'   // 图片打包后存放的目录
                        }
                    }
                ]
            },
            {
                test: /\.(htm|html)/,
                use: 'html-withimg-loader'
            }
        ]
    }
}
### 页面img引用图片
页面中经常会用到img标签，img引用的图片地址也需要一个loader来帮我们处理好
```
npm i html-withimg-loader -D
```
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.(htm|html)$/,
                use: 'html-withimg-loader'
            }
        ]
    }
}
```
这样再打包后的html文件下img就可以正常引用图片路径了
### 引用字体图片和svg图片
字体图标和svg图片都可以通过file-loader来解析
```
module.exports = {
    module: {
        rules: [
            {
                test: /\.(eot|ttf|woff|svg)$/,
                use: 'file-loader'
            }
        ]
    }
}
```
这样即使样式中引入了这类格式的图标或者图片都没有问题了，img如果也引用svg格式的话，配合上面写好的html-withimg-loader就都没有问题了

## 处理前缀postcss

## resolve



## 启动静态服务器devServer
module.exports = {
    devServer: {
        contentBase: './dist',      // 打包后的目录看效果
        host: 'localhost',          // 默认下是本机，也可以设置域名和后台配合
        port: 3000,
        open: true,                 // 自动启动浏览器
    }
}
需要再配一个脚本，打包到内存中，方便开发修改后自动刷新看到效果
"dev": "webpack-dev-server"
