const path = require('path');
// const DonePlugin = require('./plugins/done-plugin');
// const AsyncPlugin = require('./plugins/async-plugin');
// 第三方插件
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// 自己写的
const FileListPlugin = require('./plugins/file-list-plugin');
const InlineSourcePlugin = require('./plugins/inline-source-plugin');

module.exports = {
    entry: {
        index: './src/index.js',
        // a: './src/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        new FileListPlugin({
            filename: 'list.md'
        }),
        new MiniCssExtractPlugin(),
        new InlineSourcePlugin({
            match: /\.(js|css)/
        })
    ]
}