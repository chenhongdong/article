// webpack是基于Node的  用的语法都是CommonJS规范

let path = require('path');
let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let cssFile = new ExtractTextPlugin('css/style.css');
let lessFile = new ExtractTextPlugin('css/less.css');

module.exports = {
    // 入口文件
    entry: './src/index.js', 
    output: {                       
        filename: 'bundle.js',  // bundle.[hash:4].js  加个4位的md5戳
        path: path.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader',
                    publicPath: '../'
                })
            },
            {
                test: /\.(png|jpe?g|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 8192,
                            outputPath: 'images/'
                        }
                    }
                ],
            },
            {
                test: /\.(htm|html)$/,
                use: 'html-withimg-loader'
            },
            {
                test: /\.(eot|woff|ttf|svg)$/,  // 引用了字体图标或者svg图片之类的情况下，通过file-loader可以解析
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            outputPath: 'svg/'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanPlugin('dist'),
        
        new HtmlPlugin({
            template: './src/index.html',
        }),
        new ExtractTextPlugin('css/style.css'),
        new webpack.HotModuleReplacementPlugin()
    ],
    // 开发服务器的配置
    // 启动一个静态服务器
    // 默认自动刷新，热更新(页面中只有一个组件变化了，就只改这一块)
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true   // 还需要配置一个插件,除此之外还需要在写入的js文件里判断一下module.hot
    },
    // 模式的配置
    mode: 'development'
}