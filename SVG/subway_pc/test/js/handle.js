import $ from 'jquery';
import createSvg from './components/createSvg';
import { showTooltip, hideTooltip } from './components/tooltip';
import { initPopover, showPopover, hidePopover } from './components/popover';
import * as citys from '../data';
import render from './render';
import { renderCity, renderLines } from './city';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './event';
import { hidePath } from './city/lines';
import { request } from './components/request';


const gBox = $('#g-box');
const toolWidth = 50;

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

    initPopover();
}

// hover到subway路径
function hoverPath() {
    const cityCode = $('.current-city').attr('data-code');
    

    gBox.on('mouseover', 'path', function(e) {
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
            'transition': 'stroke-width ease .7s'
        });
    }).on('mouseout', 'path', function() {
        $(this).css('stroke-width', 5);
        hideTooltip();
    }).on('mouseover', 'circle', function(e) {
        request({
            qt: 'inf',
            newmap: 1,
            it: 3,
            ie: 'utf-8',
            f: '[1,12,13]',
            c: cityCode,
            m: 'sbw',
            ccode: cityCode,
            uid: $(this).attr('data-uid')
        }).then(res => {
            if (!res.content) {
                return;
            }
            const data = res.content;
            showPopover({
                title: data.name,
                datas: data.ext.line_info
            });
        });
    }).on('mouseout', 'circle', function() {
        hidePopover();  
    }).on('mouseover', 'image', function(e) {
        
        request({
            qt: 'inf',
            newmap: 1,
            it: 3,
            ie: 'utf-8',
            f: '[1,12,13]',
            c: cityCode,
            m: 'sbw',
            ccode: cityCode,
            uid: $(this).attr('data-uid')
        }).then(res => {
            console.log(res);
            if (!res.content) {
                return;
            }
            const data = res.content;
            showPopover({
                title: data.name,
                datas: data.ext.line_info,
                left: e.pageX,
                top: e.pageY
            });
        });
    }).on('mouseout', 'image', function() {
        hidePopover();  
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
        hidePath();
        $('.subways-city').removeClass('selected-city');
    });
}


export {
    init,
    handle
}