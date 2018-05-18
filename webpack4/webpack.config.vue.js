let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let isDev = process.env.NODE_ENV === 'development';
console.log(isDev);
module.exports = {
    entry: {
        vendor: ['vue']
    },
    output: {
        filename: '[name].js',
        path: path.resolve('dist'),
        library: '_dll_[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dist', '[name].manifest.json')
        })
    ],
    devServer: {
        contentBase: './dist',
        port: 3000
    },
    mode: 'development'
}

