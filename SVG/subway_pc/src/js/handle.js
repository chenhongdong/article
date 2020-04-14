import $ from 'jquery';
import { initTooltip, showTooltip, hideTooltip } from './components/tooltip';
import { initPopover, hidePopover, renderPopover } from './components/popover';
import render from './components/render';
import { renderCity, renderLines, selectCity } from './city';
import svgPanZoom from 'svg-pan-zoom';
import { showLine, hideLine } from './city/lines';
import { searchPath, removeRoute } from './components/routeplan';
import { log } from 'util';

const gBox = $('#g-box');
const toolWidth = 50;

let panZoom;


function init(opt = {}) {
    // 渲染地铁城市列表
    renderCity();
    // 渲染地铁图
    render(opt.data);
    // 渲染地铁线路表
    renderLines(opt.data);
    // 初始化Zoom
    panZoom = svgPanZoom('#subways-svg', {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        zoomScaleSensitivity: 0.2,
        minZoom: 0.5,
        maxZoom: 5
    });
    // 初始化线路气泡
    initTooltip();
    // 初始化始末时间
    initPopover();
}


function handle() {
    // hover路径
    hoverPath();
    // 切换城市
    selectCity(panZoom);
    // 高亮线路
    showLine(panZoom);
    // 搜索线路
    searchPath();

    $(document).on('click', reset);
}


// hover到subway路径
function hoverPath() {
    // const cityCode = $('.current-city').attr('data-code');
    let timer = null;

    gBox.on('mouseover', '.path', function (e) {
        let $self = $(this);
        let color = $self.attr('stroke');
        let content = $self.attr('lb');
        let left = e.pageX - toolWidth + 15;
        let top = e.pageY - toolWidth - 5;

        // 创建气泡
        showTooltip({
            content,
            left,
            top,
            color
        });


        $(this).addClass('active');
        $(this).css({
            'stroke-width': 8,
            'transition': 'stroke-width ease .5s'
        });
    }).on('mouseout', '.path', function () {
        $(this).css('stroke-width', 5);
        hideTooltip();
    }).on('mouseover', 'circle, image', function () {  // 站点首末车时间展示
        const left = parseInt($(this).offset().left),
            top = parseInt($(this).offset().top),
            uid = $(this).attr('data-uid');

        clearTimeout(timer);
        renderPopover(uid, left, top);
    }).on('mouseout', 'circle, image', function() {
        timer = setTimeout(hidePopover, 1000);
    });
}


// 重置
function reset() {
    hideLine();
    hidePopover();
    hideTooltip();
    removeRoute();
    $('.subways-city').removeClass('selected-city');
}


export {
    init,
    handle,
    reset
};