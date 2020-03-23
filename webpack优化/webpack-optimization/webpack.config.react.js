let path = require('path');
let webpack = require('webpack');

module.exports = {
    entry: {
        // test: './src/test.js'
        react: ['react', 'react-dom']
    },
    output: {
        filename: '_dll_[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: '_dll_[name]'
    },
    plugins: [
        // 动态链接库
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.resolve(__dirname, 'dist', 'manifest.json')
        })
    ],
    mode: 'development'
}