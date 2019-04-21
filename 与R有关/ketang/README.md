## 初始化项目
```
npm init -y
```

## 安装依赖包
```
webpack
yarn add webpack webpack-cli webpack-dev-server

babel
yarn add babel-loader @babel/core @babel/preset-env @babel/preset-react

react
yarn add react react-dom react-router react-router-dom react-router-redux redux react-redux redux-promise redux-thunk redux-logger redux-saga swipe-js-iso react-swipe

loader
yarn add less less-loader css-loader style-loader url-loader html-webpack-plugin
```

## 目录结构
```
src
    containers  放置页面组件，比如：Home
        components  放此页面组件独享的子组件
    components  放置页面之间可以共享的公用组件，比如Tab
    common      放置一些公共的样式等功能
    store       redux仓库  
        reducers
        actions 
        action-types
        index
    index.js    入口文件
    index.html  模板文件
```

## 前后台交互套路
1. 定义仓库中的数据结构
2. 去后台实现这个接口
3. 前台编写一个请求此接口的API方法
4. 定义action-types，修改reducer并处理此动作
5. 编写一个action方法，用来调用API方法，请求接口并返回数据，构造action派发给仓库
6. 在组件里调用此方法,并填充仓库
7. 在组件中使用此数据进行渲染