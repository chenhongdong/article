import $ from 'jquery';
import cityList from './data';

let html = '';

function renderCity() {
    html += '<div class="subways-city"><ul>';

    cityList.forEach(item => {
        html += `<li>${item.name}</li>`;
    });

    html += '</ul></div>';

    $('#subways-wrapper-map').append(html);
}

export default renderCity;