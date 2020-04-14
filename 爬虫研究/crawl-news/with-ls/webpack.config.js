const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',     // 入口文件
    output: {
        filename: 'bundle.js',
        path: resolve('dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.css']    // 省略后缀名
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: '/src/',           // 只转化src目录下的js
                exclude: /node_modules/     // 排除掉node_modules，优化打包速度
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            hash: true
        })
    ],
    devServer: {
        host: 'localhost',
        port: 5000,
        open: true
    }
}