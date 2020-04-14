import $ from 'jquery';
import render from '../components/render';
import { renderLines } from './lines';
import { reset } from '../handle';
import * as citys from '../../data';

// 城市选择
function selectCity(panZoom) {
    $('.current-city').on('click', function () {
        reset();
        $(this).parent().toggleClass('selected-city');
        return false;
    });

    $('.city-list').on('click', 'li', function () {
        let cityName = $(this).attr('data-city');

        for (let i in citys) {
            if (cityName === i) {
                handleCity(citys[i]);
                resetCity(this);
                // 切换城市后重置选中城市的坐标
                panZoom.resetPan();
            }
        }
        return false;
    });

}

function handleCity(data) {
    $('#g-box').html('');
    $('#subways-city-lines').html('');
    // 重新渲染地铁图和路线
    renderLines(data);
    render(data);
}

function resetCity(self) {
    $(self).parent().parent().removeClass('selected-city');
    $(self).parent().siblings('.current-city').html($(self).html());
    $(self).addClass('active').siblings().removeClass('active');
}

export default selectCity;