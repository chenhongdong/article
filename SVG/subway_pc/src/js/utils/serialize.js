
// 简单处理线路标题重复问题
function serialize(data) {
    if (!Array.isArray(data)) {
        return;
    }
    const result = [];
    const obj = {};

    data.forEach(item => {
        const params = {};

        if (!obj[item.abb]) {
            obj[item.abb] = true;
            params.ways = item.abb;
        }
        let merge = Object.assign({}, item, params);
        result.push(merge);
    });

    return result;
}

export default serialize;