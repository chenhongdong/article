const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'loaders')],
        // alias: {    // 别名
        //     loader1: path.resolve(__dirname, 'loaders', 'loader1.js')
        // }
    },
    devtool: 'source-map',
    // watch: true,
    module: {
        rules: [    // loader顺序：从右向左，从下到上
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.jpg$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 30*1024
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}