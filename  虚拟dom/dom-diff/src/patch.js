let allPatches;
let index = 0;  // 默认哪个需要打补丁

function patch(node, patches) {
    console.log(node);
    allPatches = patches;

    walk(node);
    // 给某个元素打补丁
}

function walk(node) {
    let current = patches[index++];
    let childNodes = node.childNodes;

    childNodes.forEach(child => walk(child));
}

export default patch;