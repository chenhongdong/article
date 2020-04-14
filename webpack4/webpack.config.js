let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let isDev = process.env.NODE_ENV === 'development';
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

let styleLess = new ExtractTextWebpackPlugin('css/style.css');
let resetCss = new ExtractTextWebpackPlugin('css/reset.css');

module.exports = {
    entry: {
        // a: './src/a.js',
        // b: './src/b.js',
        index: './src/index.js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {   // 抽离第三方插件
                    test: /node_modules/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 10
                },
                utils: {   // 抽离自己写的公共代码，common这个名字可以随意起
                    chunks: 'initial',
                    name: 'utils',
                    minSize: 0      // 只要超出0字节就生成一个新包
                }
            }
        }
    },
    output: {
        filename: 'index.js',
        path: path.resolve('dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: resetCss.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.less$/,
                use: styleLess.extract({
                    use: 'css-loader'
                })
            },
            {
                test: /\.less$/,
                use: ['css-loader', 'less-loader']
            },
            {
                test: /\.js$/,
                use: ['babel-loader', 'eslint-loader'],
                include: /src/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new MiniCssExtractPlugin({
        //     filename: 'css/a.css'
        // }),
        styleLess,
        resetCss,
        new CleanWebpackPlugin('dist'),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        /* new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index']
        }),
        // new HtmlWebpackPlugin({
        //     filename: 'b.html',
        //     template: './src/index.html',
        //     chunks: ['vendor', 'b']
        // }),
        new ExtractTextWebpackPlugin({
            filename: 'css/style.css',
            disable: isDev
        }), */
        // new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: './dist',
        port: 3000,
        open: true
    },
    mode: 'development'
}

