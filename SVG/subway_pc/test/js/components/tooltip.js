import $ from 'jquery';

function initTooltip() {
    let html = `
        <div id="subways-tooltip">
            <div class="subways-tooltip-wrap">
                <div class="subways-tooltip-txt"></div>
                <span class="subways-tooltip-icon"></span>
            </div>
        </div>`;

    $(html).appendTo($('#subways-wrapper-map'));
}

function showTooltip(options) {
    const $tip = $('#subways-tooltip');
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
    .html(html)
    .show();
}

function hideTooltip() {
    $('#subways-tooltip').hide();
}

export {
    initTooltip,
    showTooltip,
    hideTooltip
}