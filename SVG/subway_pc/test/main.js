import './css/index.css';
import * as citys from './data';
import render from './js/render';
import svgPanZoom from 'svg-pan-zoom';
import eventsHandler from './js/event';
import { handle } from './js/handle';
import { renderCity, renderLines, selectCity } from './js/city';

selectCity();
renderLines(citys.bj);
// 渲染地铁图
render(citys.bj);
handle();

svgPanZoom('#subways-svg', {
    zoomEnabled: true,
    controlIconsEnabled: false,
    fit: 1,
    center: 1,
    customEventsHandler: eventsHandler
});