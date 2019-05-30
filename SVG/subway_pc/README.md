## 语法
```
    <svg width="100" height="100">
        <circle id="circle" cx="50" cy="50" r="50"/>
    </svg>
```

### circle圆形
- cx: 横坐标
- cy: 纵坐标
- r:  半径

#### svg的css属性
- fill: 填充色
- stroke: 描边色
- stroke-width: 描边宽度

### line直线
- x1: 起点的横坐标
- y1: 起点的纵坐标
- x2: 终点的横坐标
- y2: 终点的纵坐标
```
<line x1="0" y1="200" x2="200" y2="50" style="stroke:#0cc;stroke-width:5" />
```

### polyline折线
- points: 每个端点的坐标，横坐标与纵坐标用,号隔开，每个端点之间用空格隔开
```
<polyline points="3,3 30,28, 3, 53" fill="none" stroke="skyblue" />
```