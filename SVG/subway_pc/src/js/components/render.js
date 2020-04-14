import $ from 'jquery';
import createSvg from '../utils/createSvg';
import { imgSrc } from '../common/const';

// ex 换乘标志
// rc 圆润拐弯
// st 有效站点
// no 暂缓开通

function render(data) {
    const { l, sw_xmlattr } = data.subways;
    const { c } = sw_xmlattr;

    for (let i = 0; i < l.length; i++) {
        const { l_xmlattr, p } = l[i];
        // bgx, bgy, bgurl, bgw, bgh, lb2, lb2x, lb2y仅针对北京地铁图
        const { lb, loop, lc, lbx, lby, bgx, bgy, bgurl, bgw, bgh, lb2, lb2x, lb2y, sn } = l_xmlattr;
        const color = lc.replace(/^0x/, '#');
        const txtColor = c === '北京' ? '#fff' : color;
        
        // 绘制分组，方便管理
        const name = c === '北京' ? sn : lb;
        let g = createSvg('g').appendTo('#g-box');
        g.attr('data-subway', `subway_${name}`).attr('data-pos', i);

        // 绘制路径
        renderPath({
            data: p,
            loop,
            lb,
            color,
            wrapper: g
        });

        // 绘制线路背景矩形只针对北京城市
        if (c === '北京') {
            let rectWidth = lb === '机场线' ? 50 : 70;
        
            let rect = createSvg('rect').appendTo(g).html(lb);
            rect.attr({
                width: rectWidth,
                height: 20,
                x: lbx,
                y: lby,
                fill: color
            });
        }
        
        // 绘制地铁线路名
        let text = createSvg('text').appendTo(g).html(lb).addClass('subway-name');
        text.attr({
            x: lbx + 5,
            y: lby + 15,
            fill: txtColor
        }).css('font-size', 12);

        // 绘制北京地铁线路两端不同的线路名称（如：4号线和大兴线）
        if (lb2 && lb2.length) {
            let rect = createSvg('rect').appendTo(g).html(lb2);
            rect.attr({
                width: 70,
                height: 20,
                x: lb2x,
                y: lb2y,
                fill: color
            });

            let text = createSvg('text').appendTo(g).html(lb2).addClass('subway-name');
            text.attr({
                x: lb2x + 6,
                y: lb2y + 15,
                fill: txtColor
            }).css('font-size', 12);
        }
        
         // 标志性建筑图标(目前只有北京)
         if (bgurl && bgurl.length) {
            let bgImg = createSvg('image').appendTo(g);
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
        const { l_xmlattr, p } = l[i];
        const { lb, sn } = l_xmlattr;

        // 绘制分组
        const name = c === '北京' ? sn : lb;
        let g = createSvg('g').appendTo('#g-box');
        g.attr('data-subway', `subway_${name}`).attr('data-pos', i);

        for (let j = 0; j < p.length; j++) {
            const { x, y, rx, ry, lb, ex, rc, st, uid, tip, no, dy } = p[j].p_xmlattr;
            
            if (st) {
                if (ex) {
                    // 基础换乘图标
                    let image = createSvg('image').appendTo(g);

                    image.attr({
                        width: 20,
                        height: 20,
                        x: x - 10,
                        y: y - 10,
                        cx: x,
                        cy: y,
                        'data-uid': uid,
                        'data-lb': lb
                    });
                    image[0].href.baseVal = imgSrc;
                } else {
                    // 常规站点小圆点
                    let circle = createSvg('circle').appendTo(g);
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                        'stroke-width': 1,
                        'data-uid': uid,
                        'data-lb': lb
                    });
                }
                // 创建站点名称
                let text = createSvg('text').appendTo(g).html(lb).addClass('station-name');
                text.attr({
                    x: x + rx + 2,
                    y: y + ry + 12,
                    fill: '#000'
                });
            }
            // no为暂缓开通的站点
            if (no) {
                // tip为暂缓开通文本，不需要创建站点图标
                if (!tip) {
                    let circle = createSvg('circle').appendTo(g);
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                        'stroke-dasharray': '2, 2',
                        'stroke-width': 1
                    });
                }

                let text = createSvg('text').appendTo(g).html(lb).addClass('station-name');
                text.attr({
                    x: x + rx + 2,
                    y: y + ry + 12,
                    fill: '#ccc'
                });
            }
        }
    }
}

function renderPath(options = {}) {
    let pathStr = ''; //地铁线路点
    let isRc = false; //是否圆润拐点
    let len = options.data.length;

    for (let j = 0; j < len; j++) {
        const { x, y, lb, rc } = options.data[j].p_xmlattr;
        
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
                if (j === len - 1) {
                    if (options.loop) {
                        pathStr += 'Z';
                    }
                }
            }
        }
    }

    // 绘制线路path
    let path = createSvg('path').appendTo(options.wrapper)
    path.attr({
        d: $.trim(pathStr),
        lb: options.lb,
        stroke: options.color,
        class: 'path'
    });
}

export default render;