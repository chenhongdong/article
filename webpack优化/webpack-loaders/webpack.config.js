const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, 'loaders')],
        // alias: {
        //     'loader1': path.resolve(__dirname, 'loaders', 'loader1.js'),
        //     'loader2': path.resolve(__dirname, 'loaders', 'loader2.js')
        // }
    },
    module: {
        rules: [    // loader的顺序是从右向左|从下到上的
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
                test: /\.jpg|png$/,
                // use: 'file-loader'
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 20 * 1024
                    }
                }
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    ]
}