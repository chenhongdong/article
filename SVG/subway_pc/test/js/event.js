import Hammer from 'hammerjs';
import { showPath } from './city';

const eventsHandler = {
    haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
    init: function(options) {
        let instance = options.instance,
            initialScale = 1,
            pannedX = 0,
            pannedY = 0;
        this.hammer = Hammer(options.svgElement, {
            inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
        });
        // this.hammer.get('pinch').set({
        //     enable: true
        // });
        // this.hammer.on('doubletap', function(ev) {
        //     instance.zoomIn();
        // });
        // this.hammer.on('panstart panmove', function(ev) {
        //     if (ev.type === 'panstart') {
        //         pannedX = 0
        //         pannedY = 0
        //     };
        //     instance.panBy({
        //         x: ev.deltaX - pannedX,
        //         y: ev.deltaY - pannedY
        //     });
        //     pannedX = ev.deltaX;
        //     pannedY = ev.deltaY;
        // });
        // this.hammer.on('pinchstart pinchmove', function(ev) {
        //     if (ev.type === 'pinchstart') {
        //         initialScale = instance.getZoom()
        //         instance.zoomAtPoint(initialScale * ev.scale, {
        //             x: ev.center.x,
        //             y: ev.center.y
        //         });
        //     }
        //     instance.zoomAtPoint(initialScale * ev.scale, {
        //         x: ev.center.x,
        //         y: ev.center.y
        //     });
        // });

        // this.hammer.on('doubletap', function() {
            // showPath展示路径操作
            // showPath(function(params) {
            //     console.log('showPath', params);
            //     instance.zoomAtPoint(1.2, {
            //         x: params.x,
            //         y: params.y
            //     });
            // });
        // });
        
    },
    destroy: function() {
        this.hammer.destroy();
    }
}

export default eventsHandler;