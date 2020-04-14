let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let webpack = require('webpack');
let Happypack = require('happypack');

module.exports = {
    entry: {
        index: './src/index.js',
        // other: './src/other.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },
    // 优化
    // optimization: {
    //     splitChunks: {  // 分割代码块
    //         cacheGroups: {  // 缓存组
    //             common: {   // 公共的模块
    //                 chunks: 'initial',  // 从入口处开始就提取代码
    //                 minSize: 0,         // 只要超过0K就提取
    //                 minChunks: 2,       // 只要引入超过两次就提取
    //             },
    //             vendor: {
    //                 test: /node_modules/,   // 把你抽离出来
    //                 chunks: 'initial',
    //                 minSize: 0,
    //                 minChunks: 2,
    //                 priority: 1         // 优先级高的会优先进行提取
    //             }
    //         }
    //     }
    // },
    module: {
        noParse: /jquery/,  // 不去解析jquery中的依赖库
        rules: [
            // {
            //     test: /\.js$/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             presets: [
            //                 '@babel/preset-env',
            //                 '@babel/preset-react'
            //             ]
            //         }
            //     },

            //     // happypack
            //     // use: 'Happypack/loader?id=js',
            //     exclude: /node_modules/,
            //     include: path.resolve('src')
            // },
            {
                test: /\.js$/,
                use: {
                   loader: 'babel-loader',
                   options: {
                       presets: ['@babel/preset-env', '@babel/preset-react']
                   } 
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
                // use: 'Happypack/loader?id=css'
            }
        ]
    },
    plugins: [
        // Happypack多线程打包
        // new Happypack({
        //     id: 'css',
        //     use: ['style-loader', 'css-loader']
        // }),
        // new Happypack({
        //     id: 'js',
        //     use: [
        //         {
        //             loader: 'babel-loader',
        //             options: {
        //                 presets: [
        //                     '@babel/preset-env',
        //                     '@babel/preset-react'
        //                 ]
        //             }
        //         }
        //     ]
        // }),
        // new webpack.DllReferencePlugin({
        //     manifest: path.resolve(__dirname, 'dist', 'manifest.json')
        // }),
        // new webpack.IgnorePlugin(/\.\/locale/, /moment/),
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ],
    devServer: {
        port: 3000,
        open: true,
        contentBase: './dist'
    },
    mode: 'development'
};