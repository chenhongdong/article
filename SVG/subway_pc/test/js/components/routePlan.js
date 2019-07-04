import $ from 'jquery';
import createSvg from './createSvg';
import { imgSrc } from '../common/const';

const gBox = $('#g-box');

function routePlan(data) {
    console.log(data);


    renderMask(gBox);

    renderPath(data);

    renderSign(data);
}

// 渲染遮罩背景
function renderMask(wrapper) {
    let rect = createSvg('rect').appendTo(wrapper);
    rect.attr({
        id: 'rect-mask',
        width: 3000,
        height: 3000,
        x: -1500,
        y: -1500,
        fill: '#fff',
        'fill-opacity': 0.9
    });
}

// 渲染标志
function renderSign(data) {
    let g = createSvg('g').appendTo(gBox);
    g.attr('data-route', 'sign');

    const { transfer } = data;
    const { segments } = transfer;

    for (let i = 0; i < segments.length; i++) {
        const subway = segments[i].subway;
        const { stops } = subway;

        for (let j = 0; j < stops.length; j++) {
            const { st, ex, location } = stops[j];
            const x = location.split(',')[0];
            const y = location.split(',')[1];

            if (st) {
                if (ex) {
                    let image = createSvg('image').appendTo(g);
            
                    image.attr({
                        width: 20,
                        height: 20,
                        x: x - 10,
                        y: y - 10,
                    });
                    image[0].href.baseVal = imgSrc;
                } else {
                    let circle = createSvg('circle').appendTo(g);
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#fff',
                        stroke: '#000',
                        'stroke-width': 1,
                    });
                }
            }
        }
    }

    
}

// 渲染路径
function renderPath(data = {}) {
    let segments = data.transfer.segments;
    let g = createSvg('g').appendTo(gBox);
    g.attr('data-route', 'path');

    for (let i = 0; i < segments.length; i++) {
        let pathStr = ''; //地铁线路点
        let isRc = false; //是否圆润拐点
        const subway = segments[i].subway;
        const { color, stops } = subway;

        for (let j = 0; j < stops.length; j++) {
            const { location, rc } = stops[j];
            const x = location.split(',')[0];
            const y = location.split(',')[1];

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
                }
            }
        }
        // 绘制线路path
        let path = createSvg('path').appendTo(g);
        path.attr({
            d: $.trim(pathStr),
            stroke: `#${color}`
        });
    }
}

export default routePlan;