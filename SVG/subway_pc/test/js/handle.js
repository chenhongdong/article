import $ from 'jquery';
import { initTooltip, showTooltip, hideTooltip } from './components/tooltip';
import { initPopover, hidePopover, renderPopover } from './components/popover';
import * as citys from '../data';
import render from './render';
import { renderCity, renderLines } from './city';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './event';
import { showPath, hidePath } from './city/lines';
import { searchPath, removeRoute } from './components/routePlan';

const gBox = $('#g-box');
const toolWidth = 50;

let panZoom;




function init() {
    // 渲染地铁城市列表
    renderCity();
    // 渲染地铁图
    render(citys.bj);
    // 渲染地铁线路表
    renderLines(citys.bj);

    panZoom = svgPanZoom('#subways-svg', {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        zoomScaleSensitivity: 0.2,
        minZoom: 0.5,
        maxZoom: 5,
        customEventsHandler: eventsHandler
    });

    initTooltip();

    initPopover();
}


function handle() {
    handlePath();

    selectCity();

    showPath(panZoom);

    searchPath();

    $(document).on('click', () => {
        reset();
    });
}

// hover到subway路径
function handlePath() {
    // const cityCode = $('.current-city').attr('data-code');


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

        renderPopover(uid, left, top);
    }).on('mouseout', 'circle, image', hidePopover);
}




// 城市选择
function selectCity() {
    $('.current-city').on('click', function () {
        $(this).parent().toggleClass('selected-city');
        return false;
    });

    $('.city-list').on('click', 'li', function () {
        let cityName = $(this).attr('data-city');
        reset();

        for (let i in citys) {
            if (cityName === i) {
                handleCity(this, citys[i]);
            }
        }
        return false;
    });
}

function handleCity(self, data) {
    $('#g-box').html('');
    $('#subways-city-lines').html('');
    // 重新渲染地铁图和路线
    renderLines(data);
    render(data);

    $(self).parent().parent().removeClass('selected-city');
    $(self).parent().siblings('.current-city').html($(self).html());
    $(self).addClass('active').siblings().removeClass('active');
}

// 重置
function reset() {
    hidePath();
    hidePopover();
    removeRoute();
    $('.subways-city').removeClass('selected-city');
}


export {
    init,
    handle,
    reset
}