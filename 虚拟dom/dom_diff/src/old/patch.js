import { setAttr, Element, render } from './element';

let allPatches;
let index = 0;

function patch(node, patches) {
    allPatches = patches;

    walk(node);
}

function walk(node) {
    let curPatch = allPatches[index++];
    let childNodes = node.childNodes;

    childNodes.forEach(child => walk(child));

    if (curPatch) {
        doPatch(node, curPatch);
    }
}

function doPatch(node, patches) {
    patches.forEach(patch => {
        switch (patch.type) {
            case 'TEXT':
                node.textContent = patch.text;
                break;
            case 'ATTR':
                for (let key in patch.attr) {
                    let value = patch.attr[key];

                    if (value) {
                        setAttr(node, key, value);
                    } else {
                        node.removeAttribute(key);
                    }
                }
                break;
            case 'REPLACE':
                let newNode = patch.newNode;
                newNode = (newNode instanceof Element) ? render(newNode) : document.createTextNode(newNode);
                node.parentNode.replaceChild(newNode, node);
                break;
            case 'REMOVE':
                node.parentNode.removeChild(node);
                break;
            default:
                break;
        }
    });
}

export default patch;