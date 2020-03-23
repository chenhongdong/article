let path = require('path');

module.exports = (env) => {
    return {
        mode: env,
        // 入口
        entry: './src/index.js',
        // 出口
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist')
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: []
                }
            ]
        }
    }
}