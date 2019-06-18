import $ from 'jquery';

const imgSrc = 'data:image/png;base64,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';
let repeatStr = '';  //uid字符串判断重复点

// 创建svg内部元素
function svgEle(name) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', name));
}


// ex 换乘标志
// rc 圆润拐弯
// st 有效站点
// no 暂缓开通

function render(data) {
    const { l, sw_xmlattr } = data.subways;
    const { c } = sw_xmlattr;

    for (let i = 0; i < l.length; i++) {
        const { l_xmlattr, p } = l[i];
        const { lb, loop, lc, lbx, lby, bgx, bgy, bgurl, bgw, bgh, lb2, lb2x, lb2y } = l_xmlattr;

        let pathStr = ''; //地铁线路点
        let isRc = false; //是否圆润拐点
        

        for (let j = 0; j < p.length; j++) {
            const { x, y, lb, rc } = p[j].p_xmlattr;

            if (isRc) {
                isRc = false;
                pathStr += `${x} ${y} `;
            } else {
                if (rc) {
                    isRc = true
                    pathStr += `Q${x} ${y} `;
                } else {
                    if (j == 0) {
                        pathStr += `M${x} ${y} `;
                    } else {
                        pathStr += `L${x} ${y} `;
                    }
                    if (j === p.length - 1) {
                        if (loop) {
                            pathStr += 'Z';
                        }
                    }
                }
            }
        }

        const color = lc.replace(/^0x/, '#');
        const txtColor = c === '北京' ? '#fff' : color;

        // 绘制组，方便管理
        let g = svgEle('g').appendTo('#g-box');
        g.attr('data-line', 'lines_'+lb)

        // 绘制线路path
        let path = svgEle('path').appendTo(g)
        path.attr({
            d: $.trim(pathStr),
            lb: lb,
        }).css("stroke", color);

        // 绘制线路背景矩形只针对北京城市
        if (c === '北京') {
            let rectWidth = lb === '机场线' ? 50 : 70;
        
            let rect = svgEle('rect').appendTo(g).html(lb);
            rect.attr({
                width: rectWidth,
                height: 20,
                x: lbx,
                y: lby,
                fill: color
            });
        }
        let subwayName = c === '北京' ? `地铁${lb}` : lb;
        if (c === '北京' && lb === '机场线') {
            subwayName = '机场线';
        }
        
        // 绘制地铁线路名
        let text = svgEle('text').appendTo(g).html(subwayName).addClass('subway-name');
        text.attr({
            x: lbx + 5,
            y: lby + 15,
            fill: txtColor
        }).css('font-size', 12);

        if (lb2 && lb2.length) {
            let rect = svgEle('rect').appendTo(g).html(lb2);
            rect.attr({
                width: 70,
                height: 20,
                x: lb2x,
                y: lb2y,
                fill: color
            });

            let text = svgEle('text').appendTo(g).html(lb2).addClass('subway-name');
            text.attr({
                x: lb2x + 6,
                y: lb2y + 15,
                fill: txtColor
            }).css('font-size', 12);
        }
        
         // 标志性建筑图标
         if (bgurl && bgurl.length) {
            let bgImg = svgEle('image').appendTo(g);
            bgImg.attr({
                width: bgw,
                height: bgh,
                x: bgx - 10,
                y: bgy -10
            });
            bgImg[0].href.baseVal = bgurl;
        }
    }

    
    for (let i = 0; i < l.length; i++) {
        const { p } = l[i];

        let g = svgEle('g').appendTo('#g-box');
        g.attr('data-station', 'station');

        for (let j = 0; j < p.length; j++) {
            const { x, y, rx, ry, lb, ex, rc, st, uid, tip, no } = p[j].p_xmlattr;

            if (st) {
                if (ex) {
                    // 基础换乘图标
                    if (!repeatStr.includes(uid)) {
                        let image = svgEle('image').appendTo(g);
                        image.attr({
                            width: 20,
                            height: 20,
                            x: x - 10,
                            y: y - 10
                        });
                        image[0].href.baseVal = imgSrc;
                    }
                } else {
                    let circle = svgEle('circle').appendTo(g);
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                        'stroke-width': 1
                    });
                }
                if (!repeatStr.includes(uid)) {
                    let text = svgEle('text').appendTo(g).html(lb).addClass('station-name');
                    text.attr({
                        x: x + rx + 2,
                        y: y + ry + 12,
                        fill: '#000'
                    });
                    repeatStr += uid
                }
            }
            // no为暂缓开通的站点
            if (no) {
                // tip为暂缓开通文本，不需要创建站点图标
                if (!tip) {
                    let circle = svgEle('circle').appendTo(g);
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                        'stroke-width': 1
                    });
                }

                if (!repeatStr.includes(uid)) {
                    let text = svgEle('text').appendTo(g).html(lb).addClass('station-name');
                    text.attr({
                        x: x + rx + 2,
                        y: y + ry + 12,
                        fill: '#ccc'
                    });
                    repeatStr += uid
                }
            }
        }
    }
}


export default render;