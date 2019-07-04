import $ from 'jquery';
import createSvg from './createSvg';

function routePlan(data) {
    console.log(data);
    let g = createSvg('g').appendTo('#g-box');
    g.attr('data-route', 'path');

    renderPath({
        data,
        loop: false,
        lb: '路径',
        color: '#00a1f4',
        wrapper: g
    });
}


function renderPath(options = {}) {
    
    let len = options.data.length;
    let segments = options.data.transfer.segments;

    for (let i = 0; i < segments.length; i++) {
        let pathStr = ''; //地铁线路点
        let isRc = false; //是否圆润拐点
        const data = segments[i].subway;
        const {color, stops} = data;

        for (let j = 0; j < stops.length; j++) {
            const { name, location, rc, ex } = stops[j];
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
        console.log(pathStr)
        // 绘制线路path
        let path = createSvg('path').appendTo(options.wrapper)
        path.attr({
            d: $.trim(pathStr),
            stroke: `#${color}`
        });
    }
}

export default routePlan;