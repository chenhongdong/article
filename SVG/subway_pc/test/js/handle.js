import $ from 'jquery';

function handle() {
    $('path').hover(function() {
        $(this).addClass('active');
        $(this).css({
            'stroke-width': 8,
            'transition': 'stroke-width ease .7s'
        });
    }, function() {
        $(this).css('stroke-width', 5);
    });
}


export {
    handle
}