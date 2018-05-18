// webpack是基于Node的  用的语法都是CommonJS规范

let path = require('path');
let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    // 入口文件
    // entry: './src/index.js',

    // 多个入口 是没有关系的但是打包要到一起去 可以写一个数组，实现多个文件打包
    // entry: ['./src/index.js', './src/utils.js'],

    // 多页面开发，怎么配置多页面
    entry: {
        index: './src/index.js',
        login: './src/login.js'
    },
    // 出口文件  
    output: {                       
        // filename: 'bundle.js',  // bundle.[hash:4].js  加个4位的md5戳
        filename: '[name].js',
        // 必须是绝对路径
        path: path.resolve('dist')
    },
    // resolve: {
    //     extensition: ['.js', '.css', '.json']
    // },
    // 对模块的处理 loader加载器
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({     // 通过ExtractText拆分成link形式引用
                    use: ['css-loader', 'postcss-loader']
                })
            },
            // {
            //     test: /\.less$/,
            //     // use: ['style-loader', 'css-loader', 'less-loader']  // 编译less
            //     use: ExtractTextPlugin.extract({    // 通过ExtractText拆分成link形式引用
            //         use: [
            //             'css-loader',
            //             'less-loader'
            //         ]
            //     })
            // }
        ]
    },
    // webpack对应的插件
    plugins: [
        // 实现html打包功能 可以通过一个模板实现打包出引用好路径的html
        new HtmlPlugin({
            // 用哪个html作为模板
            template: './src/index.html',   
            hash: true,
            minify: {
                // 可以去除换行打包成一行
                //collapseWhitespace: true,
                // 删除双引号
                //removeAttributeQuotes: true
            },
            filename: 'index.html',
            chunks: ['index']
        }),
        // new HtmlPlugin({
        //     template: './src/login.html',
        //     filename: 'login.html',
        //     chunks: ['login']
        // }),
        new CleanPlugin('dist'),
        // 热替换，热替换不是刷新
        new webpack.HotModuleReplacementPlugin(),
        // 拆分css文件
        new ExtractTextPlugin({
            filename: 'css/[name].css'
        })
    ],
    // 开发服务器的配置
    // 启动一个静态服务器
    // 默认自动刷新，热更新
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