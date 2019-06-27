import $ from 'jquery';
import throttle from '../utils/throttle';


function showTooltip(options) {
    let $tip = $('<div id="subways-tooltip">');
    let html = `
        <div class="subways-tooltip-wrap">
            <div class="subways-tooltip-txt">${options.content}</div>
            <span class="subways-tooltip-icon" style="border-top-color:${options.color}"></span>
        </div>`;

    $tip.css({
            backgroundColor: options.color || '#fff',
            left: options.left || -500,
            top: options.top || -500
        })
        .addClass('s-tooltip-lines')
        .html(html)
        .appendTo($('#subways-wrapper-map'));
}

function hideTooltip() {
    let timer;
    timer = setTimeout(() => {
        $('#subways-tooltip').remove();
        clearTimeout(timer);
    }, 70);
}

export {
    showTooltip,
    hideTooltip
}