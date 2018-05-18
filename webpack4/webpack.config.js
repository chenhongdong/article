'use strict';

let ExtractTextPlugin = require("extract-text-webpack-plugin");
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let webpack = require('webpack');
let path = require('path'),
	src = path.join(__dirname, 'src'),
	dist = path.join(__dirname, 'dist');

module.exports = {
	entry : './src/index.js',
	output : {
		filename: 'index.js',
		path : `${dist}/js/`
	},
	resolve: {
		extensions: ['.css', '.js', '.es']
	},
	module : {
		rules: [{
			test: /\.css$/,
			exclude: '/node_modules/',
			use: ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: [{
					loader: "css-loader",
					options: {
						sourceMap: true,
						importLoaders: 1
					}
                }],
                // publicPath: '../'
            })
		}, 
		{
			test: /\.js$/,
			use: 'eslint-loader',
			exclude: /node_modules/
		},
		{
			test: /\.es$/,
			exclude: '/node_modules/',
			use: [{
				loader: 'babel-loader',
				options: {
					presets: ['es2015'],
				}
			}]
		}, {
			test: /\.svg$/,
			use: [
                {
                    loader: 'file-loader',
                    options: {
                        outputPath: `../assets/`
                    }
                }
            ]
		}]
	},
	plugins: [
        new CleanWebpackPlugin('../public'),
        new ExtractTextPlugin('../css/[name].css'),
        new HtmlWebpackPlugin({
            template: './src/index.html'
		}),
    ],
    devServer: {
        contentBase: `${dist}/js`,
        port: 4000,
		open: true
	},
	mode: 'development'
};