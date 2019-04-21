const {resolve} = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    mode: 'development',
    resolve: {
        alias: {
            '@': resolve('src')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                ["@babel/plugin-proposal-class-properties", { "loose": true }]
                            ]
                        }
                    }
                ],
                exclude: /node_modules/,
                include: resolve('./src')
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader', 'css-loader', 'less-loader'
                ],
                include: resolve('./src')
            },
            {
                test: /\.(png|gif|jpg)/,
                use: ['url-loader']
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html'
        })
    ]
}