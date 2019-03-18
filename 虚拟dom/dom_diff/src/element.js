
class Element {
    constructor(type, props, children) {
        this.type = type;
        this.props = props;
        this.children = children;
    }
}

function createElement(type, props, children) {
    return new Element(type, props, children);
}

function render(domObj) {
    let el = document.createElement(domObj.type);

    for (let key in domObj.props) {

    }
}

function setAttr() {
    
}

export {
    createElement,
    Element,
    render,
    renderDom,
    setAttr
}