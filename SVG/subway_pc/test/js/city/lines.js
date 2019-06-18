import $ from 'jquery';

// 城市线路
let html = '';

function renderLines(data) {
    html += '<div class="subways-city-lines">'
    const lines = data.subways.l;


    lines.forEach(line => {
        const { l_xmlattr } = line;
        let name = l_xmlattr.lb;
        let color = l_xmlattr.lc.replace(/^0x/, '#');

        if (name.indexOf('地铁') > 0) {
            name = l_xmlattr.lb.replace(/地铁/, '');
        }

        html += `<a href="javascript:;" style="color: ${color}">${name}</a>`;
    });

    html += '</div>';

    $('#subways-wrapper-map').append(html);
}



export default renderLines;