const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: './src/basic/reducer.jsx',
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.jsx', '.js', '.json'],
        alias: {
            '@': path.join(__dirname, 'src')
        }
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                },
                exclude: /node_modules/
            },
            {
                enforce: 'pre',
                test: /\.jsx?$/,
                loader: 'source-map-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
            {
                test: /\.(jpg|png|gif|svg)$/,
                loader: 'url-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ],
    devServer: {
        historyApiFallback: {
            index: 'index.html'
        }
    }
}