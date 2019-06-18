import $ from 'jquery';

// 创建svg内部元素
function createSvg(name) {
    return $(document.createElementNS('http://www.w3.org/2000/svg', name));
}

export default createSvg;