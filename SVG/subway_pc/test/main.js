import * as city from './data';
import render from './js/render';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './js/handle';

// 渲染地铁图
render(city.bj);


svgPanZoom('#subways-svg', {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: 1,
    center: 1,
    customEventsHandler: eventsHandler
});