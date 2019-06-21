import $ from 'jquery';
import cityList from './data';

let html = '';

function renderCity() {
    html += `<div class="subways-city"><div class="current-city">${cityList[0].name}</div><ul class="city-list">`;

    cityList.forEach(item => {
        html += `<li data-city=${item.city}>${item.name}</li>`;
    });

    html += '</ul></div>';

    $('#subways-wrapper-map').append(html);
}

export default renderCity;