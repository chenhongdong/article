function renderSvg(data) {
    const { subways } = data;
    const { l } = subways;

    console.log(l);
    for (let i = 0; i < l.length; i++) {
        const { l_xmlattr, p } = l[i];
        
    }
}


export default renderSvg;