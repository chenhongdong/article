function diff(oldTree, newTree) {
    let patches = {};

    // 第一次比较应该是树的第0个索引
    let index = 0;
    // 递归树 比较后的结果放到补丁里
    walk(oldTree, newTree, index, patches);

    return patches;
}

function diffAttr(oldAttrs, newAttrs) {
    let patch = {};
    // 判断老的属性中和新的属性的关系
    for (let key in oldAttrs) {
        if (oldAttrs[key] !== newAttrs[key]) {
            patch[key] = newAttrs[key]; // 有可能还是undefined
        }
    }

    for (let key in newAttrs) {
        // 老节点没有新节点的属性
        if (!oldAttrs.hasOwnProperty(key)) {
            patch[key] = newAttrs[key];
        }
    }
    return patch;
}

function diffChildren(oldChildren, newChildren, index, patches) {
    // 比较老的第一个和新的第一个
    oldChildren.forEach((child, idx) => {
        walk(child, newChildren[idx], ++index, patches);
    });
}

function isString(node) {
    return Object.prototype.toString.call(node) === '[object String]';
}

const ATTRS = 'ATTRS';
const TEXT = 'TEXT';
function walk(oldNode, newNode, index, patches) {
    // 每个元素都有一个补丁
    let current = [];
    if (isString(oldNode) && isString(newNode)) {
        // 判断文本是否一致
        if (oldNode !== newNode) {
            current.push({ type: TEXT, text: newNode});
        }

    } else if (oldNode.type === newNode.type) {
        // 比较属性是否有更改
        let attrs = diffAttr(oldNode.props, newNode.props);
        if (Object.keys(attrs).length > 0) {
            current.push({ type: ATTRS, attrs});
        }
        // 如果有子节点，遍历子节点
        diffChildren(oldNode.children, newNode.children, index, patches);
    }
    // 当前元素确实有补丁
    if (current.length > 0) {
        // 将元素和补丁对应起来，放到大补丁包中
        patches[index] = current;
    }
    console.log(patches);

}

export default diff;