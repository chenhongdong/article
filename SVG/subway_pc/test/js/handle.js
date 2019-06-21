import $ from 'jquery';
import createSvg from './common/createSvg';
import * as citys from '../data';
import render from './render';
import { renderCity, renderLines } from './city';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './event';



const gBox = $('#g-box');

function init() {
    renderCity();
    renderLines(citys.bj);
    // 渲染地铁图
    render(citys.bj);

    svgPanZoom('#subways-svg', {
        zoomEnabled: true,
        controlIconsEnabled: false,
        fit: true,
        center: true,
        zoomScaleSensitivity: 0.2,
        minZoom: 0.7,
        maxZoom: 5,
        customEventsHandler: eventsHandler
    });
}


function handle() {
    hoverPath();

    reset();

    selectCity();
}

// hover到subway路径
function hoverPath() {
    $('#g-box').on('mouseover', 'path', function() {
        $(this).addClass('active');
        $(this).css({
            'stroke-width': 8,
            'transition': 'stroke-width ease .7s'
        });
    }).on('mouseout', 'path', function() {
        $(this).css('stroke-width', 5);
    });
}




// 城市选择
function selectCity() {
    $('.current-city').on('click', function() {
        $(this).parent().toggleClass('selected-city');
        return false;
    });

    $('.city-list').on('click', 'li', function() {
        let cityName = $(this).attr('data-city');
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
    $('#subways-city-lines').html('123')
    // 重新渲染地铁图和路线
    renderLines(data);
    render(data);

    $(self).parent().parent().removeClass('selected-city');
    $(self).parent().siblings('.current-city').html($(self).html());
    $(self).addClass('active').siblings().removeClass('active');
}

// 重置
function reset() {
    $(document).on('click', function() {
        // $('#rect-mask').hidex();
        $('.subways-city').removeClass('selected-city');
    });
}


export {
    init,
    handle
}