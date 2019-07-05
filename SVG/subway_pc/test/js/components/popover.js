import $ from 'jquery';
import serialize from '../utils/serialize';
import { reqInfo } from './request';

function initPopover() {
    let html = `
        <div id="subways-popover">
            <div class="subways-popover-title"></div>
            <div class="subways-popover-content">
            </div>
        </div>        
    `;

    $(html).appendTo($('#subways-wrapper-map'));
}

function renderPopover(uid, left, top) {
    reqInfo({
        uid
    }).then(res => {
        if (!res.content) {
            return;
        }
        const data = res.content;
        showPopover({
            title: data.name,
            datas: data.ext.line_info,
            left,
            top
        });
    });
}

function showPopover(opts) {
    const $pop = $('#subways-popover');
    const $title = $pop.find('.subways-popover-title');
    const $main = $pop.find('.subways-popover-content');
    const noTime = '-- : --';


    let serializeData = serialize(opts.datas);
    let content = '';

    serializeData.forEach(item => {
        let title = item.ways ? `<p class="subways-popover-txt" style="background-color: #${item.clr.slice(2)}">${item.ways}</p>` : '';

        content += `<div class="subways-popover-line">
                        ${title}
                        <ul class="subways-popover-list">
                            <li>
                                <span>${item.terminals}</span>
                                <span class="dir">方向</span>
                            </li>
                            <li>
                                <span class="flag">始</span>
                                <span class="time">${item.first_time || noTime}</span>
                                <span class="flag">末</span>
                                <span class="time">${item.last_time || noTime}</span>
                            </li>
                        </ul>
                    </div>`;
    });
    $title.text(opts.title);
    $main.html(content);

    $pop.css({
        left: opts.left - $pop.width() / 2 + 4,
        top: opts.top - $pop.height() - 30
    }).show();
}

function hidePopover() {
    $('#subways-popover').hide();
}

export {
    initPopover,
    showPopover,
    hidePopover,
    renderPopover
};