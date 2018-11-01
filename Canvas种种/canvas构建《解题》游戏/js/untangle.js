$(function() {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(200, 200, 100, .6)';
   /*  ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill(); */

    // 绘制下半圆
    ctx.beginPath();
    ctx.arc(100, 100, 50, 0, Math.PI);
    // ctx.closePath();
    ctx.fill();
    // 绘制上半圆
    ctx.beginPath();
    ctx.arc(100, 80, 50, 0, Math.PI, true);
    ctx.fill();
    // 绘制左半圆
    ctx.beginPath();
    ctx.arc(200, 100, 50, Math.PI/2, Math.PI*3/2);
    ctx.fill();
    // 绘制右半圆
    ctx.beginPath();
    ctx.arc(220, 100, 50, Math.PI/2, Math.PI*3/2, true);
    ctx.fill();
    // 绘制一个接近圆的形状
    ctx.beginPath();
    ctx.arc(300, 300, 50, Math.PI*2/3, Math.PI*4/3, true);
    ctx.fill();
     // 绘制一个小圆弧
     ctx.beginPath();
     ctx.arc(280, 300, 50, Math.PI*2/3, Math.PI*4/3);
     ctx.fill();
});