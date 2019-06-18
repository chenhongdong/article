import $ from 'jquery';

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
    $('.subways-city-lines').on('mouseover', 'a', function() {
        console.log('aaa')
    });
}


export {
    handle
}