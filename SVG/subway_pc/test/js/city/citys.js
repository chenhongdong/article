import $ from 'jquery';
import cityList from './data';

let html = '';

function renderCity() {
    // 暂时写死初始化城市为北京，之后通过接口获取当前所在城市
    html += `<div class="subways-city"><div class="current-city" data-code=${cityList[0].code}>${cityList[0].name}</div><ul class="city-list">`;

    cityList.forEach(item => {
        html += `<li data-city=${item.city}>${item.name}</li>`;
    });

    html += '</ul></div>';

    $('#subways-wrapper-map').append(html);
}

export default renderCity;