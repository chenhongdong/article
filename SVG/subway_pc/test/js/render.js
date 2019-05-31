function render(data) {
    const {l} = data.subways;
        //地铁线路
    for (var i = 0; i < l.length; i++) {
        var { l_xmlattr, p } = l[i]
        var { lb, loop, uid } = l_xmlattr
        // if (!uid) { //暂未开通
        //     break;
        // }
        var dStr = ""; //地铁线路点
        var isLb = false; //是否圆润拐点
        for (var j = 0; j < p.length; j++) {
            var { x, y, lb, st, ex, rc } = p[j].p_xmlattr
            if (isLb) {
                isLb = false
                dStr += x + " " + y + " "
            } else {
                if (rc) {
                    isLb = true
                    dStr += "Q" + x + " " + y + " "
                } else {
                    if (j == 0) {
                        dStr += "M" + x + " " + y + " "
                    } else {
                        dStr += "L" + x + " " + y + " "
                    }
                    if (j == p.length - 1) {
                        if (loop) {
                            dStr += "Z"
                        }
                    }
                }
            }
        }

        var { lb, lc, lbx, lby } = l_xmlattr
        
        var path = $('<path>').appendTo('#g-box')
        
        path.attr({
            d: $.trim(dStr),
            lb: lb
        }).css("stroke", "#" + lc.split("x")[1]);
        var text = $('<text>').appendTo('#g-box').html(lb).addClass("subway-name")
        text.attr({
            x: lbx - 10,
            y: lby + 15,
        }).css("fill", "#" + lc.split("x")[1]);
    }

    var repeatStr = "" //uid字符串判断重复点
    /* for (var i = 0; i < l.length; i++) {
        var { l_xmlattr, p } = l[i]
            // if (!l_xmlattr.uid) { //暂未开通
            //     break;
            // }
        for (var j = 0; j < p.length; j++) {
            var { x, y, rx, ry, lb, ex, rc, st, uid } = p[j].p_xmlattr
            if (st) {
                if (ex) {
                    if (!repeatStr.includes(uid)) {
                        var image = $('<image>').appendTo('#g-box')
                        image.attr({
                            width: "20",
                            height: "20",
                            x: x - 10,
                            y: y - 10
                        });
                        image[0].href.baseVal = imgSrc;
                    }
                } else {
                    var circle = $('<circle>').appendTo('#g-box')
                    circle.attr({
                        cx: x,
                        cy: y,
                        r: 4
                    }).css("stroke", "#" + l_xmlattr.lc.split("x")[1]);
                }
                if (!repeatStr.includes(uid)) {
                    var text = $('<text>').appendTo('#g-box').html(lb).addClass("station-name")
                    text.attr({
                        x: x + rx + 2,
                        y: y + ry + 12,
                    });
                    repeatStr += uid
                }
            }
        }
    } */
   
}