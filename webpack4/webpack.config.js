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
    entry: './src/index.js',
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
                test: /\.js$/,
<<<<<<< HEAD
                use: ['babel-loader', 'eslint-loader']
=======
                use: ['babel-loader', 'eslint-loader'],
                include: /src/,
                exclude: /node_modules/
>>>>>>> 959131a25cc64a8e1c87140def50a186404bd9d4
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
        new HtmlWebpackPlugin({
            filename: 'b.html',
            template: './src/index.html',
            chunks: ['vendor', 'b']
        }), */
        /* new ExtractTextWebpackPlugin({
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

