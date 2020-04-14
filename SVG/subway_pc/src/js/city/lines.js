import $ from 'jquery';
import createSvg from '../utils/createSvg';
import { hidePopover } from '../components/popover';

const gBox = $('#g-box');

// 创建个复制版本的子集
let subChild;
// 创建城市标识容器
let cityLines = $('<div class="subways-city-lines" id="subways-city-lines"></div>');
$('#subways-wrapper-map').append(cityLines);

// 渲染地铁线路标识
function renderLines(data) {
    cityLines.html('');

    let html = '';
    const { l, sw_xmlattr } = data.subways;
    const { c } = sw_xmlattr;


    l.forEach(line => {
        const { l_xmlattr } = line;
        // px, py, pz表示当前该线路展示的坐标及放大倍数
        const { px, py, pz, sn, lb, lc } = l_xmlattr;
        let name = c === '北京' ? sn : lb;
        // 去掉颜色上带的0x
        let color = lc.replace(/^0x/, '#');

        html += `<a href="javascript:;" style="color: ${color}" data-subway="subway_${name}" data-x=${px} data-y=${py} data-z=${pz}>${name}</a>`;
    });

    cityLines.html(html);
}

// 点击线路标识展现对应路径
function showLine(ele) {
    $('.subways-city-lines').on('click', 'a', function () {
        const self = $(this);
        const curAttr = self.attr('data-subway');
        const x = Number(self.attr('data-x'));
        const y = Number(self.attr('data-y'));
        const z = Number(self.attr('data-z'));

        // 清除高亮及展示的提示框
        hideLine();
        hidePopover();
        // 当前选中线路标识高亮
        $(this).addClass('active').siblings().removeClass('active');
        // 高亮选中线路
        highLight(curAttr, ele, x, y, z);
        return false;
    });
}

function highLight(curAttr, ele, x, y, z) {
    // 创建蒙层
    let rect = createSvg('rect').appendTo(gBox);
    rect.attr({
        id: 'rect-mask',
        width: 3000,
        height: 3000,
        x: -1500,
        y: -1500,
        fill: '#fff',
        'fill-opacity': 0.9
    });

    // 拿到选中线路
    let children = gBox.find('g');

    for (let i = 0; i < children.length; i++) {
        let child = $(children[i]);
        let attr = child.attr('data-subway');

        if (curAttr === attr) {
            // 拷贝DOM，不改变原有children数据显示位置
            subChild = child.clone();
            subChild.attr('class', 'subways-copy-path');
            subChild.appendTo(gBox);
        }
    }

    // 根据点击的线路展示其高亮时的位置和放大倍数
    if (x && y && z) {
        ele.pan({ x, y });
        ele.zoom(z);
    }
}

function hideLine() {
    // 清除矩形背景
    $('#rect-mask').remove();
    // 清除拷贝DOM元素
    $('.subways-copy-path').remove();
    // 清除高亮样式
    $('#subways-city-lines').find('a').removeClass('active');
}


export {
    renderLines,
    showLine,
    hideLine
};