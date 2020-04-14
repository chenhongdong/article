$(function() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(200, 200, 100, .6)';
   /*  ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill(); */

    // 绘制下半圆
    // ctx.beginPath();
    // ctx.arc(100, 100, 50, 0, Math.PI);
    // // ctx.closePath();
    // ctx.fill();
    // // 绘制上半圆
    // ctx.beginPath();
    // ctx.arc(100, 80, 50, 0, Math.PI, true);
    // ctx.fill();
    // // 绘制左半圆
    // ctx.beginPath();
    // ctx.arc(200, 100, 50, Math.PI/2, Math.PI*3/2);
    // ctx.fill();
    // // 绘制右半圆
    // ctx.beginPath();
    // ctx.arc(220, 100, 50, Math.PI/2, Math.PI*3/2, true);
    // ctx.fill();
    // // 绘制一个接近圆的形状
    // ctx.beginPath();
    // ctx.arc(300, 300, 50, Math.PI*2/3, Math.PI*4/3, true);
    // ctx.fill();
    //  // 绘制一个小圆弧
    //  ctx.beginPath();
    //  ctx.arc(280, 300, 50, Math.PI*2/3, Math.PI*4/3);
    //  ctx.fill();

    /* ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(100, 100, 50, 0, Math.PI*2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(210, 100, 50, 0, Math.PI);
    ctx.strokeStyle = 'blue';
    ctx.closePath();
    ctx.stroke(); */

    // 用来保存圆的基本信息
    class Circle {
        constructor(x, y, r) {
            this.x = x;
            this.y = y;
            this.radius = r;
        }
    }
    // 画个直线Line类，用来保存线段的基本信息
    class Line {
        constructor(startPoint, endPoint, thickness) {
            this.startPoint = startPoint;
            this.endPoint = endPoint;
            this.thickness = thickness;
        }
    }

    // 封装画圆函数
    function drawCircle(ctx, x, y, r) {
        ctx.fillStyle = 'rgba(200, 200, 100, .9)';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2);
        ctx.fill();
    }
    // 封装画直线函数
    function drawLine(ctx, x1, y1, x2, y2, thickness) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = '#cfc';
        ctx.stroke();
    }
    // 清空画布函数
    function clear(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }


    let untangleGame = {
        circles: [],    // 用来存储圆的位置，因为canvas中不能访问到绘制的对象
        thinLineThickness: 1,   // 直线的厚度
        lines: [],      // 存储直线的位置
    };
    let circleRadius = 10;
    let width = canvas.width;
    let height = canvas.height;

    // 随机放5个圆
    const CIRCLES_COUNT = 5;
    for (let i = 0; i < CIRCLES_COUNT; i++) {
        let x = Math.random() * width;
        let y = Math.random() * height;
        drawCircle(ctx, x, y, circleRadius);
        untangleGame.circles.push(new Circle(x, y, circleRadius));
    }
    console.log(untangleGame.circles);
    // 绘制直线
    for (let i = 0; i < untangleGame.circles.length; i++) {
        let startPoint = untangleGame.circles[i];
        for (let j = 0; j < i; j++) {
            let endPoint = untangleGame.circles[j];
            drwaLine(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 1);
            untangleGame.lines.push(new Line(startPoint, endPoint, untangleGame.thinLineThickness));
        }
    }
});