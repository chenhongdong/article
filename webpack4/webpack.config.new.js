let path = require('path');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let isDev = process.env.NODE_ENV === 'development';
let MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: {
        a: './src/a.js',
        b: './src/b.js',
        index: './src/index.js'
    },
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             vendor: {   // 抽离第三方插件
    //                 test: /node_modules/,
    //                 chunks: 'initial',
    //                 name: 'vendor',
    //                 priority: 10
    //             },
    //             utils: {   // 抽离自己写的公共代码，common这个名字可以随意起
    //                 chunks: 'initial',
    //                 name: 'utils',
    //                 minSize: 0      // 只要超出0字节就生成一个新包
    //             }
    //         }
    //     }
    // },
    output: {
        filename: '[name].js',
        path: path.resolve('dist')
    },
    resolve: {
        // 别名
        alias: {
            q: './src/jquery.js'
        },
        // 省略后缀
        extensions: ['.js', '.json', '.css']
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                /* use: ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader']
                }) */
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.js$/,
                use: 'babel-loader',
                include: /src/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.DllReferencePlugin({
        //     manifest: path.join(__dirname, 'dist', 'vendor.manifest.json')
        // }),
        new MiniCssExtractPlugin({
            filename: 'css/a.css'
        }),
        new CleanWebpackPlugin('dist'),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            filename: 'b.html',
            template: './src/index.html',
            chunks: ['vendor', 'b']
        }),
        // new ExtractTextWebpackPlugin({
        //     filename: 'css/style.css',
        //     disable: isDev
        // }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: './dist',
        port: 3000,
        hot: true,
        open: true
    },
    mode: 'development'
}

