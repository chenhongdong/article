### 获取canvas上下文
```
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
```
通过获取到的canvas上下文来绘制形状
#### canvas的arc函数绘制不同弧形及圆
- arc函数支持的参数有6种
    - X: x轴上的圆弧中心点
    - Y: y轴上的圆弧中心点
    - radius: 半径是圆弧中心点到弧边的距离。半径越大，圆越大
    - startAngle: 弧度的起点，表示从圆周的哪个位置开始绘制
    - endAngle: 弧度的终点，表示圆弧从开始的位置画到结束的角度
    - counterclockwise: 圆弧绘制是顺时针方向还是逆时针方向，默认是false(顺时针)
arc函数里的参数接收的是弧度而非角度，所以需要公式来转换一下
```
    弧度 = π/180 * 角度
```