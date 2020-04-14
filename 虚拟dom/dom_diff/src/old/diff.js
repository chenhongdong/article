function diff(oldTree, newTree) {
    let patches = {};   // 大补丁集合
    let index = 0;

    walk(oldTree, newTree, index, patches);

    return patches;
}
const REMOVE = 'REMOVE';
const TEXT = 'TEXT';
const ATTR = 'ATTR';
const REPLACE = 'REPLACE';
let num = 0;

function walk(oldNode, newNode, index, patches) {
    let curPatch = [];  // 当前的补丁

    if (!newNode) {
        curPatch.push({ type: REMOVE, index });
    } else if (isString(oldNode) && isString(newNode)) {
        if (oldNode !== newNode) {
            curPatch.push({ type: TEXT, text: newNode });
        }
    } else if (oldNode.type === newNode.type) {
        let attr = diffAttr(oldNode.props, newNode.props);
        if (Object.keys(attr).length > 0) {
            curPatch.push({ type: ATTR, attr });
        }

        diffChildren(oldNode.children, newNode.children, patches);
    } else {
        curPatch.push({ type: REPLACE, newNode });
    }

    if (curPatch.length) {
        patches[index] = curPatch;
    }
}

function isString(obj) {
    return typeof obj === 'string';
}

function diffAttr(oldAttr, newAttr) {
    let patch = {};

    for (let key in oldAttr) {
        if (oldAttr[key] !== newAttr[key]) {
            patch[key] = newAttr[key];
        }
    }

    for (let key in newAttr) {
        if (!oldAttr.hasOwnProperty(key)) {
            patch[key] = newAttr[key];
        }
    }

    return patch;
}

function diffChildren(oldChildren, newChildren, patches) {
    oldChildren.forEach((child, index) => {
        walk(child, newChildren[index], ++num, patches);
    });
}

export default diff;