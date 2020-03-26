## loader是个函数
webpack默认只能转化js的代码，如果想去转化其他的代码，就需要loader是用来转换

### resolveLoader
专门解析loader的，可以配置别名alias，也可以配置对应的modules

modules是数组，默认是去找`node_modules`目录，如果找不到就让它去我们写的loaders目录查找

### loader的分类
pre 在前面的
post 在后面的
normal 正常的

### loader的顺序
pre -> normal -> inline -> post

### 符合的意义
!号的意思是导到前面去
-!不会让文件再去通过pre+normal的loader去处理了
! 禁用普通的loader
!! 什么都不要

### pitchLoader和normalLoader
loader默认是由两部分组成pitchLoader和normalLoader

pitch和normal的执行顺序正好相反

当pich没有订阅或者没有返回值时，会先一次执行pitch，再获取资源执行loader

如果定义的某个pitch有返回值则会跳过读取资源和自己的loader

### loader的特点
第一个loader要返回js脚本

每个loader只做一件事，为了使loader在更多场景链式调用

loader就是个模块

loader是无状态的(纯函数)，确保loader在不同模块转换之间不保存状态

## babel-loader实现
运用babel的核心包去进行转换

### loader工具库
- `loader-utils`包。它提供了许多有用的工具，但最常用的一种工具是获取传递给 loader 的选项
- `schema-utils`包配合`loader-utils`，用于保证`loader`的options选项，进行与 JSON Schema 结构一致的校验

站在巨人的肩膀上好办事，现在让我们开始写个babel-loader
```
// babel-loader.js文件

// 我们需要babel的核心包用来转化代码
const babel = require('@babel/core');
// 需要工具库来拿到options选项
const loaderUtils = require('loader-utils');

function loader(source) {
    const options = loaderUtils(this);
    // 开始转义
    let {code, map, ast} = babel.transform(source, {
        ...options,
        sourceMaps: true,
        filename: this.resourcePath.split('/').pop()
    });

    return this.callback(null, code, map, ast);
}

module.exports = loader;
```

## file-loader和url-loader
### file-loader
file-loader的作用就是根据图片生成一个md5戳，通过webpack特有的`emitFile`方法，产生一个文件放到打包的目录下，返回当前的图片路径

默认情况下，资源文件`source`会被转化为 UTF-8 字符串，然后传给 loader。通过设置 raw，loader 可以接收原始的 Buffer

由于图片不是字符串，是二进制，所以需要将source转成Buffer来使用

file-loader需要返回一个路径

### url-loader
处理路径和limit

base64基本格式

`data:image/jpeg;base64,你的base64码`

## 解析样式的loader
style-loader, css-loader, less-loader

JSON.stringify会把换行回车转成\r\n