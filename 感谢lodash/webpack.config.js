const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './love/main.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('dist')
    },
    resolve: {
        extensions: ['.js', '.json', '.css']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: /love/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            filename: 'index.html'
        })
    ],
    devServer: {
        contentBase: './dist',
        host: 'localhost',
        port: 3000,
        open: true,
        hot: true
    }
}