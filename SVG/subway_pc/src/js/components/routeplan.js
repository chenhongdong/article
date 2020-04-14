import $ from 'jquery';
import createSvg from '../utils/createSvg';
import { imgSrc, startIcon, endIcon, SECONDS } from '../common/const';
import routeApi from '../api/route';
import { reset } from '../handle';

const gBox = $('#g-box');
let num = 0;

function routePlan(data, left, top) {
    renderMask(gBox);
    renderPath(data);
    renderSign(data);
    renderInfo(data, left, top);

    $('#subways-route').on('click', '.cancel', function () {
        removeRoute();
    });
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

// 渲染站点标志
function renderSign(data) {
    let g = createSvg('g').appendTo(gBox);
    g.attr('data-route', 'sign').attr('id', 'subways-sign-route');

    const { transfer } = data;
    const { segments } = transfer;

    for (let i = 0; i < segments.length; i++) {
        const subway = segments[i].subway;
        const { point, stops } = subway;


        for (let j = 0; j < stops.length; j++) {
            const { x, y, st, ex, location } = stops[j];

            if (st) {
                if (ex) {
                    let image = createSvg('image').appendTo(g);

                    image.attr({
                        width: 20,
                        height: 20,
                        x: x - 10,
                        y: y - 10,
                        cx: x,
                        cy: y
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
        renderIcon({
            type: 'final',
            data: point,
            wrapper: g
        });
    }
}

// 渲染起终点图标
function renderIcon(options = {}) {
    const { type, data, wrapper } = options;
    if (type === 'final') {
        if (data && Object.keys(data).length) {
            const { x, y } = data;

            let image = createSvg('image').appendTo(wrapper);
            image.attr({
                width: 20,
                height: 30,
                x: x - 10,
                y: y - 30
            })
            image[0].href.baseVal = data.is ? startIcon : endIcon;
        }
    } else if (type === 'first') {
        let image = createSvg('image').appendTo(wrapper);
        image.attr({
            width: 20,
            height: 30,
            x: options.x - 10,
            y: options.y - 30
        })
        image[0].href.baseVal = num === 1 ? startIcon : endIcon;
    }

}



// 渲染路程信息
function renderInfo(data, left, top) {
    let l = left, t = top + 50;
    let html = `<div id="subways-route" style="left: ${l}px; top: ${t}px;">
            <div class="subways-route-title">${data.destination}</div>
            <ul class="subways-route-list">
                <li>
                    <span class="name">票价</span>
                    <span class="value"><em>${data.price}</em>元</span>
                </li>
                <li>
                    <span class="name">预计时间</span>
                    <span class="value"><em>${Math.round(data.duration / SECONDS)}</em>分钟</span>
                </li>
            </ul>
            <div class="cancel">取消</div>
        </div>`;

    $(html).appendTo($('#subways-wrapper-map'));
}

// 渲染路径
function renderPath(data = {}) {
    let segments = data.transfer.segments;
    let g = createSvg('g').appendTo(gBox);
    g.attr('data-route', 'path').attr('id', 'subways-path-route');

    for (let i = 0; i < segments.length; i++) {
        let pathStr = ''; //地铁线路点
        let isRc = false; //是否圆润拐点
        const subway = segments[i].subway;
        const { color, stops } = subway;

        for (let j = 0; j < stops.length; j++) {
            const { x, y, rc } = stops[j];

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


function searchPath() {
    gBox.on('click', 'circle, image', function () {
        const offset = $(this).offset(),
            left = offset.left,
            top = offset.top;

        const x = $(this).attr('cx');
        const y = $(this).attr('cy');

        num++;

        reset();

        // 绘制点击的起点和终点图标
        let g = createSvg('g').appendTo(gBox);
        g.attr('id', 'subways-route-icon-' + num);
        renderIcon({
            type: 'first',
            wrapper: g,
            x,
            y
        });

        if (num === 2) {
            // 清除点击后绘制的图标
            $('#subways-route-icon-1').remove();
            $('#subways-route-icon-2').remove();
            // 绘制路径规划
            routePlan(routeApi.route, left, top);
            num = 0;
        }
        return false;
    });
}

function removeRoute() {
    $('#subways-path-route').remove();
    $('#subways-sign-route').remove();
    $('#subways-route').remove();
}

export {
    searchPath,
    removeRoute
}