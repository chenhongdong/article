#! /usr/bin/env node

// 当前代码需要使用Node环境来执行

console.log('pack开始');

const path = require('path');

// 拿到配置文件
let config = require(path.resolve('webpack.config.js'));

let Compiler = require('../lib/Compiler.js');
let compiler = new Compiler(config);

compiler.hooks.entryOption.call();

// 标识运行编译
compiler.run();