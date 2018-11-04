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
#### 绘制路径
- 填充路径  ctx.fill()
- 绘制描边  ctx.stroke()

#### 每次绘制新形状前先调用beginPath
```
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(0, 0, 50, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.arc(100, 100, 50, 0, Math.PI);
    ctx.fill();
```
通过调用两个beginPath方法，就会在路径列表中产生两个不同的路径，而且之间相互不会影响

#### closePath
closePath会在终点和起点之间绘制一条直线，用来闭合整个路径
如果只是用来填充fill的话就不需要调用closePath
仅在描边stroke的时候才需要调用closePath进行闭合

#### js中如何生成随机数
在js中生成随机数主要靠Math.random()函数
常用的方式有两种：
1. 在给定范围内生成随机数
    - 代码
        Math.floor(Math.random() * B) + A
        栗子： Math.floor(Math.random() * 10) + 5生成5~14之间的随机整数
2. 生成true或false
    - 代码
        (Math.random() > 0.495)各占50%的几率
#### 画直线的方法
- moveTo(x, y)
相当于是抬起笔到某个位置
- lineTo(x, y)
相当于从下笔的位置画到目标位置
- lineWidth
描边线条的粗细
- storke()
描边的方法

#### 交点方程式