function diff(oldTree, newTree) {
    let patches = {};

    let index = 0;

    walk(oldTree, newTree, index, patches);

    return patches;
}

const REMOVE = 'REMOVE';
const TEXT = 'TEXT';
const ATTRS = 'ATTRS';
const REPLACE = 'REPLACE';
let num = 0;

function walk(oldNode, newNode, index, patches) {
    // 存放当前补丁的数组
    let current = [];

    if (!newNode) {
        // 没有新节点，表示节点被删除了
        current.push({ type: REMOVE, index });
    } else if (isString(oldNode) && isString(newNode)) {
        // 新老节点都是文本，表示节点类型是TEXT
        if (oldNode !== newNode) {
            current.push({ type: TEXT, text: newNode });
        }
    } else if (oldNode.type === newNode.type) {
        let attrs = diffAttr(oldNode.props, newNode.props);
        console.log(attrs);
        if (Object.keys(attrs).length > 0) {
            current.push({ type: ATTRS, attrs });
        }

        diffChildren(oldNode.children, newNode.children, patches);
    } else {
        current.push({ type: REPLACE, newNode });
    }

    if (current.length > 0) {
        patches[index] = current;
    }

}

function isString(obj) {
    return typeof obj === 'string';
}

function diffAttr(oldAttr, newAttr) {
    let patch = {};

    // 看看老属性里面有没有新的属性
    for (let key in oldAttr) {
        // 如果没有的话，就直接将新属性里的值赋给对象上的key
        if (oldAttr[key] !== newAttr[key]) {
            patch[key] = newAttr[key];  // 有可能会是undefined
        }
    }

    // 再看一下新属性里有没有老属性里的值
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