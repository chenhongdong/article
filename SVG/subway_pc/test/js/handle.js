import $ from 'jquery';
import createSvg from './common/createSvg';

function handle() {
    // hover到subway路径
    $('path').hover(function() {
        $(this).addClass('active');
        $(this).css({
            'stroke-width': 8,
            'transition': 'stroke-width ease .7s'
        });
    }, function() {
        $(this).css('stroke-width', 5);
    });

    // hover线路展现对应路径
    let flag = false;
    let gBox = $('#g-box');

    $('.subways-city-lines').on('click', 'a', function() {
        console.log($(this).attr('data-subway'));
        let curAttr = $(this).attr('data-subway');

        if (!flag) {
            let rect = createSvg('rect').appendTo(gBox);
            rect.attr({
                width: 3000,
                height: 3000,
                x: -1500,
                y: -1500,
                fill: '#fff',
                'fill-opacity': 0.9
            });

            flag = true;
        }

        let children = gBox.find('g');

        for (let i = 0; i < children.length; i++) {
            let child = $(children[i]);
            let attr = child.attr('data-subway');
            
            if (curAttr === attr) {
                console.log(child);
                child.appendTo(gBox);
            }
        }

    });
}


export {
    handle
}