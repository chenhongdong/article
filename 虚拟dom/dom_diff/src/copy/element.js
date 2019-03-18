// 创建一个Element类
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}


// 创建虚拟dom的方法
function createElement(type, props, children) {
    return new Element(type, props, children);
}

// 创建完了虚拟dom之后
// 就需要把它渲染出来，render方法就是干这件事的
/* 
    Element {
        children: (3) [Element, Element, Element]
        props: {class: "list"}
        type: "ul"
    }
*/
function render(domObj) {
    let el = document.createElement(domObj.type);

    // for...in遍历domObj的props来设置属性
    for (let key in domObj.props) {
        let value = domObj.props[key];
        setAttr(el, key, value);
    }

    // 通过domObj.children来遍历子节点
    domObj.children.forEach(child => {
        child = (child instanceof Element) ? render(child) : document.createTextNode(child);
        el.appendChild(child);
    });

    return el;
}

function setAttr(node, key, value) {
    switch (key) {
        case 'value':
            if (node.tagName.toLowerCase() === 'input' ||
                node.tagName.toLowerCase() === 'textarea') {
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

function renderDom(el, target) {
    target.appendChild(el);
}

export { Element, createElement, render, renderDom, setAttr };