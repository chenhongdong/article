function loader(source) {
    let reg = /url\((.+?)\)/g;
    let current;
    let pos = 0;
    let res = ['let list = []'];

    while (current = reg.exec(source)) {
        // exec返回一个数组，并且会更新lastIndex属性值，
        // 第一项是匹配的全部字符，第二项是分组捕获的字符
        let [imageUrl, group] = current;
        // lastIndex为即将开始匹配url字符的索引位置
        let lastIndex = reg.lastIndex - imageUrl.length;
        console.log(imageUrl, '---', group, lastIndex);
        res.push(`list.push(${JSON.stringify(source.slice(pos, lastIndex))})`);
        pos = reg.lastIndex;
        res.push(`list.push('url(' + require(${group})+ ')')`);
    }
    res.push(`list.push(${JSON.stringify(source.slice(pos))})`);
    // 导出
    res.push(`module.exports = list.join('')`);

    return res.join('\r\n');
}

module.exports = loader;