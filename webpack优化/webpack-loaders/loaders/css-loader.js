function loader(source) {
    let reg = /url\((.+?)\)/g;
    let pos = 0;
    let current;
    let arr = ['let list = []'];

    while (current = reg.exec(source)) {
        let [matchUrl, group] = current;
        let last = reg.lastIndex - matchUrl.length;
        // url之前的部分
        arr.push(`list.push(${JSON.stringify(source.slice(pos, last))})`);

        pos = reg.lastIndex;
        // 替换url里面的部分，把group改成require的写法
        arr.push(`list.push('url('+require(${group})+')`);
    }
    // url最后的部分拼接上
    arr.push(`list.push(${JSON.stringify(source.slice(pos))})`);
    // 最后导出
    arr.push(`module.exports = list.join('')`);
    return arr.join('\r\n');
}

module.exports = loader;