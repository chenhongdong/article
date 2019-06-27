import $ from 'jquery';

function showPopover(options) {
    let html = `
        <div id="subways-popover">
            <div class="subways-popover-title">${options.title}</div>
            <div class="subways-popover-content ${options.type === 'single' ? 'subways-popover-single' : ''}">         
    `;
    const noTime = '-- : --';
    console.log(options);
    options.datas.forEach(item => {
        html += `<div class="subways-popover-line">
                    <p class="subways-popover-txt" style="background-color: #${item.clr.slice(2)}">${item.abb}</p>
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

    html += '</div></div>';

    $(html).appendTo($('#subways-wrapper-map'));
}

function hidePopover() {

}

export {
    showPopover,
    hidePopover
};