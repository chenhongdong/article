const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve('dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                include: /src/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin('./dist'),
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ],
    devServer: {
        contentBase: './dist',
        port: 4000,
        open: true
    },
    mode: 'development'
}