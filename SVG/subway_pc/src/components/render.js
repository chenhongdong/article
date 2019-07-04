const $svg = document.querySelector('#g-wrap');



function render(data) {
    const { l } = data.subways;

    for (let i = 0; i < l.length; i++) {
        const { l_xmlattr, p } = l[i];
        const { lb, lc, loop, lbx, lby } = l_xmlattr;   // lb 线路  lc 线路色值  loop 是否为环线
        let pathStr = '';   // path路径线路拼接字符串
        let isRc = false;   // 是否有圆润拐点
        
        for (let j = 0; j < p.length; j++) {
            const { lb, x, y, ex, st, rc } = p[j].p_xmlattr;

            if (isRc) {
                isRc = false;
                pathStr += `${x} ${y} `;
            } else {
                if (rc) {
                    isRc = true;
                    pathStr += `Q${x} ${y} `;
                } else {
                    if (j === 0) {
                        pathStr += `M${x} ${y} `;
                    } else {
                        pathStr += `L${x} ${y} `;
                    }

                    if (j === p.length - 1) {
                        if (loop) {
                            pathStr += 'Z';     // Z表示闭合路径
                        }
                    }
                }
            }
        }

        let path = document.createElement('path');
        let color = lc.replace(/0x/, '#');
        path.setAttribute('d', pathStr.trim());
        path.setAttribute('lb', lb);
        // 设置样式
        path.style.cssText = `stroke:${color};stroke-width:8;fill:none`;

        $svg.appendChild(path);
    }
}




export default render;