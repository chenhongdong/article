$(function() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(200, 200, 100, .6)';

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
    function drawCircle(ctx, x, y) {
        // +++5.1.2 填充径向渐变
        let circle_gradient = ctx.createRadialGradient(x-3, y-3, 1, x, y, untangleGame.circleRadius)
        circle_gradient.addColorStop(0, '#fff');
        circle_gradient.addColorStop(1, '#00a1f4');
        ctx.fillStyle = circle_gradient;
        // --- ctx.fillStyle = 'rgba(200, 200, 100, .9)';
        ctx.beginPath();
        ctx.arc(x, y, untangleGame.circleRadius, 0, Math.PI*2);
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
    // 为每个圆分配连接线的函数
    function connectCircles() {
        // 根据圆的关卡数据设置所有连接线
        let level = untangleGame.levels[untangleGame.currentLevel];
        untangleGame.lines.length = 0;
        
        for (let i in level.relationship) {
            let connectedPoints = level.relationship[i].connectedPoints;
            let startPoint = untangleGame.circles[i];
            for (let j in connectedPoints) {
                let endPoint = untangleGame.circles[connectedPoints[j]];
                untangleGame.lines.push(new Line(startPoint, endPoint, untangleGame.thinLineThickness));
            }
        }
    }
    // 绘制线条和圆的更新
    function gameLoop() {
        // 获取canvas引用和绘图上下文
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');

        // 重绘前清空一下
        clear(ctx);

        // ++++5.3 绘制图像
        // 在加载背景时绘制启动画面
        let load_gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        load_gradient.addColorStop(0, '#ccc');
        load_gradient.addColorStop(1, '#efefef');
        ctx.fillStyle = load_gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // 绘制加载中的文本
        ctx.font = '34px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.fillText('loading...', ctx.canvas.width/2, ctx.canvas.height/2);
        // 加载背景图
        // untangleGame.background = new Image();
        // untangleGame.background.onload = function() {
        //     setInterval(gameLoop, 30);
        // };
        // untangleGame.background.src = './images/board.jpg';

        // +++5.1.1 绘制渐变背景
        let bg_gradient =  ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        bg_gradient.addColorStop(0, '#0cc');
        bg_gradient.addColorStop(0.5, 'rgba(255, 0, 0, .5)');
        bg_gradient.addColorStop(1, '#00a1f4');
        ctx.fillStyle = bg_gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // +++5.2
        // 绘制标题文本
        ctx.font = '26px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.fillText('解谜游戏', ctx.canvas.width/2, 50);

        // 绘制关卡进度文本
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`关卡 ${untangleGame.currentLevel}, 完成： ${untangleGame.progressPercentage}%`, ctx.canvas.width, ctx.canvas.height - 5);

        // 绘制所有保存的线
        for (let i = 0; i < untangleGame.lines.length; i++) {
            let line = untangleGame.lines[i];
            let startPoint = line.startPoint;
            let endPoint = line.endPoint;
            let thickness = line.thickness;
            drawLine(ctx, startPoint.x, startPoint.y, endPoint.x, endPoint.y, thickness);
        }
        // 绘制所有保存的圆
        for (let i = 0; i < untangleGame.circles.length; i++) {
            let circle = untangleGame.circles[i];
            drawCircle(ctx, circle.x, circle.y);
        }
    }


    let untangleGame = {
        circles: [],    // 用来存储圆的位置，因为canvas中不能访问到绘制的对象
        thinLineThickness: 1,   // 细线的厚度
        boldLineThickness: 5,   // 粗细的厚度
        lines: [],      // 存储直线的位置
        currentLevel: 0,
        circleRadius: 10,
        // +++5.2 百分比作为全局变量使用
        progressPercentage: 0
    };
    // 添加关卡数据
    untangleGame.levels = [
        {
            level: 0,
            circles: [
                {x: 400, y: 156},
                {x: 381, y: 241},
                {x: 84, y: 233},
                {x: 88, y: 73}
            ],
            relationship: {
                0: {connectedPoints: [1, 2]},
                1: {connectedPoints: [0, 3]},
                2: {connectedPoints: [0, 3]},
                3: {connectedPoints: [1, 2]}
            }
        },
        {
            level: 1,
            circles: [
                {x: 401, y: 73},
                {x: 400, y: 240},
                {x: 88, y: 241},
                {x: 84, y: 72}
            ],
            relationship: {
                0: {connectedPoints: [1, 2, 3]},
                1: {connectedPoints: [0, 2, 3]},
                2: {connectedPoints: [0, 1, 3]},
                3: {connectedPoints: [0, 1, 2]}
            }
        },
        {
            level: 2,
            circles: [
                {x: 92, y: 85},
                {x: 253, y: 13},
                {x: 393, y: 86},
                {x: 390, y: 214},
                {x: 248, y: 275},
                {x: 95, y: 216}
            ],
            relationship: {
                0: {connectedPoints: [2, 3, 4]},
                1: {connectedPoints: [3, 5]},
                2: {connectedPoints: [0, 4, 5]},
                3: {connectedPoints: [0, 1, 5]},
                4: {connectedPoints: [0, 2]},
                5: {connectedPoints: [1, 2, 3]}
            }
        }
    ];
    // 初始化关卡数据
    function initCurrentLevel() {
        untangleGame.circles = [];
        let level = untangleGame.levels[untangleGame.currentLevel];
        for (let i = 0; i < level.circles.length; i++) {
            untangleGame.circles.push(new Circle(level.circles[i].x, level.circles[i].y, 10));
        }
        // 设置圆后再设置连接线数据
        connectCircles();
        updateLineIntersection();
    }
    // 检测玩家是否过关
    function checkLevelCompleteness() {
        if ($('#progress').html() === '100') {
            if (untangleGame.currentLevel + 1 < untangleGame.levels.length) {
                untangleGame.currentLevel++;
            }
            initCurrentLevel();
        }
    }
    // 更新关卡解题进度
    function updateLevelProgress() {
        // 检测当前关卡的解题进度
        let progress = 0;
        for (let i = 0; i < untangleGame.lines.length; i++) {
            if (untangleGame.lines[i].thickness === untangleGame.thinLineThickness) {
                progress++;
            }
        }
        
        untangleGame.progressPercentage = Math.floor(progress/untangleGame.lines.length*100);
        $('#progress').html(untangleGame.progressPercentage);

        // 显示当前关卡
        $('#level').html(untangleGame.currentLevel);
    }

    let circleRadius = 10;
    let width = canvas.width;
    let height = canvas.height;
    initCurrentLevel();
    // connectCircles();

    // 给canvas添加鼠标事件
    // 检查按下鼠标的位置是否在任何一个圆之上
    // 设置那个圆为拖拽目标小圆球
    $('#canvas').on('mousedown', function(e) {
        let canvasPos = $(this).offset();
        let mouseX = (e.pageX - canvasPos.left) || 0;
        let mouseY = (e.pageY - canvasPos.top) || 0;

        for (let i = 0; i < untangleGame.circles.length; i++) {
            let circleX = untangleGame.circles[i].x;
            let circleY = untangleGame.circles[i].y;
            let radius = untangleGame.circles[i].radius;

            if (Math.pow(mouseX - circleX, 2) + Math.pow(mouseY - circleY, 2) < Math.pow(radius, 2)) {
                untangleGame.targetCircle = i;
                break;
            }
        }
    }).on('mousemove', function(e) { // 当鼠标移动时，移动拖拽目标小圆球
        if (untangleGame.targetCircle !== undefined) {
            let canvasPos = $(this).offset();
            let mouseX = (e.pageX - canvasPos.left) || 0;
            let mouseY = (e.pageY - canvasPos.top) || 0;
            let radius = untangleGame.circles[untangleGame.targetCircle].radius;
            untangleGame.circles[untangleGame.targetCircle] = new Circle(mouseX, mouseY, radius);
        }
        connectCircles();
        updateLineIntersection();
        updateLevelProgress();
    }).on('mouseup', function() { // 当放开鼠标，清除拖拽小圆球的数据
        untangleGame.targetCircle = undefined;
        // 每次放开鼠标，都检测是否过关
        checkLevelCompleteness();
    });

    // 设置游戏主循环的循环间隔
    setInterval(gameLoop, 30);

    // 检测相交线函数
    function isIntersect(line1, line2) {
        // 转换line1为一般式: Ax+By=C
        let a1 = line1.endPoint.y - line1.startPoint.y;
        let b1 = line1.startPoint.x - line1.endPoint.x;
        let c1 = a1 * line1.startPoint.x + b1 * line1.startPoint.y;

        // 转换line2为一般式: Ax+By=C
        let a2 = line2.endPoint.y - line2.startPoint.y;
        let b2 = line2.startPoint.x - line2.endPoint.x;
        let c2 = a2 * line2.startPoint.x + b2 * line2.startPoint.y;

        // 计算交点
        let d = a1 * b2 - a2 * b1;
        // 当d=0时，两条线平行
        if (d === 0) {
            return false;
        } else {
            let x = (b2*c1 - b1*c2) / d;
            let y = (a1*c2 - a2*c1) / d;
            // 检测截点是否在两条线段上
            if ((isInBetween(line1.startPoint.x, x, line1.endPoint.x) ||
                isInBetween(line1.startPoint.y, y, line1.endPoint.y)) &&
                (isInBetween(line2.startPoint.x, x, line2.endPoint.x) ||
                isInBetween(line2.startPoint.y, y, line2.endPoint.y))
            ) {
                return true;
            }
        }

        return false;
    }

    // 如果b在a和c之间返回true
    // 当a等于b或b等于c时排除结果，返回false
    function isInBetween(a, b, c) {
        // 如果b几乎等于a或c，返回false
        // 为了避免在浮点运算时两值几乎相等，但存在相差0.0000...0001这种情况出现
        // 以下方式避免发生
        if (Math.abs(a - b) < 0.000001 || Math.abs(b - c) < 0.000001) {
            return false;
        }

        return (a < b && b < c) || (c < b && b < a);
    }

    // 相交线加粗的函数
    function updateLineIntersection() {
        // 检测相交的线并加粗
        for (let i = 0; i < untangleGame.lines.length; i++) {
            for (let j = 0; j < i; j++) {
                let line1 = untangleGame.lines[i];
                let line2 = untangleGame.lines[j];
                // 如果检测到两条线相交，加粗该线段
                if (isIntersect(line1, line2)) {
                    line1.thickness = untangleGame.boldLineThickness;
                    line2.thickness = untangleGame.boldLineThickness;
                }
            }
        }
    }
});