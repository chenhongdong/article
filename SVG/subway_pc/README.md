## 项目结构
```
    --node_modules
    --src                   // 源文件
        --css               // css样式
        --data              // 所有城市地铁数据
        --js                // js脚本文件
        index.html          // html模板
        main.js             // 主入口文件
    package.json            // 包文件
    webpack.config.js       // webpack配置文件
```

### html模板
```
    <div id="subways-wrapper-map">
        <svg id="subways-svg" width="1680" height="1280">
            <g id="g-box" font-size="10" fill="none" stroke-width="5"></g>
        </svg>
    </div>
```

### 主入口文件main.js
- init初始化渲染视图
- handle处理函数

### js脚本
```
    api目录
        route.js        路径规划接口示例
    city目录
        citys.js        渲染地铁城市列表
        data.js         开通地铁城市列表
        index.js        地铁城市文件
        lines.js        渲染当前城市包含线路及高亮线路
        select.js       切换地铁城市
    common目录
        const.js        常量
    components目录
        popover.js      站点首末车时间提示框
        render.js       渲染svg地铁线路图
        request.js      请求首末车时间
        routeplan.js    路径规划(起点-终点)
        tooltip.js      展示当前为哪条线路气泡
    utils目录
        createSvg.js    创建svg内部元素
        serialize.js    序列化首末车线路数据
    handle.js           初始化及交互处理
```