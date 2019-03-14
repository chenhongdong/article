// 虚拟dom元素的类，构建实例对象，用来描述dom
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}
// 设置属性
function setAttr(node, key, value) {
    switch(key) {
        // node是一个input或者textarea
        case 'value':
            if (node.tagName.toUpperCase() === 'INPUT' ||
            node.tagName.toUpperCase() === 'TEXTAREA') {
                node.value = value;
            } else {
                node.setAttribute(key, value);
            }
            break;
        case 'style':
            node.style.cssText = value;
            break;
        default:
            node.setAttribute(key, value);
            break;
    }
}

// 返回虚拟节点 object
function createElement(type, props, children) {
    return new Element(type, props, children);
}

// render方法可以将vNode转化成真实dom
function render(eleObj) {
    let el = document.createElement(eleObj.type);

    for (let key in eleObj.props) {
        // 设置属性的方法
        setAttr(el, key, eleObj.props[key]);
    }
    // 遍历儿子
    // 如果是虚拟dom继续渲染
    // 不是就代表是文本节点
    eleObj.children.forEach(child => {
        child = (child instanceof Element) ? render(child) : document.createTextNode(child);
        el.appendChild(child);
    });

    return el;
}
// 将元素插入到页面内
function renderDom(el, target) {
    target.appendChild(el);
}

export { createElement, render, Element, renderDom, setAttr };