import $ from 'jquery';
import createSvg from './common/createSvg';
import * as citys from '../data';
import render from './render';
import { renderCity, renderLines } from './city';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './event';
import { hidePath } from './city/lines';


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

    tooltip();
}

// hover到subway路径
function hoverPath() {
    gBox.on('mouseover', 'path', function(e) {
        let $self = $(this);
        let strokeColor = $self.attr('stroke');
        let content = $self.attr('lb');
        let $tooltip = $('#subways-tooltip');

        let iLeft = e.pageX - $tooltip.width() / 2 - 12;
        let iTop = e.pageY - $tooltip.height() / 2 - 30;
        
        $tooltip.css({
            backgroundColor: strokeColor,
            left: iLeft,
            top: iTop
        }).find('.subways-tooltip-txt').html(content);
        $tooltip.find('.subways-tooltip-icon').css({borderTopColor: strokeColor});

        $(this).addClass('active');
        $(this).css({
            'stroke-width': 8,
            'transition': 'stroke-width ease .7s'
        });
    }).on('mouseout', 'path', function() {
        $(this).css('stroke-width', 5);
    });
}

function tooltip(type = 'line', content = '') {
    let $tip = $('<div>');
    $tip.attr('id', 'subways-tooltip').html(`<div class="subways-tooltip-wrap"><div class="subways-tooltip-txt">${content}</div><span class="subways-tooltip-icon"></span></div>`);

    if (type === 'line') {
        $tip.addClass('s-tooltip-lines');
    } else if (type === 'station') {
        $tip.addClass('s-tooltip-station');
    }

    $tip.appendTo($('#subways-wrapper-map'));
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
        hidePath();
        $('.subways-city').removeClass('selected-city');
    });
}


export {
    init,
    handle
}