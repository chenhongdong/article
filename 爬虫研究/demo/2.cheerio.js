// cheerio的基本用法  可以说是jq熟悉了，写起来就顺风顺水了
const cheerio = require('cheerio');

// 加载DOM
/* let html = '<h3 class="title">你好，旧时光</h3>';
const $ = cheerio.load(html);

$('h3.title').text('最好的我们');
$('h3').addClass('active');

console.log($.html()); */



// 选择器
/* const html = `
    <ul id="foods">
        <li class="food sh">生蚝</li>
        <li class="food sb">扇贝</li>
        <li class="food ky">烤鱼</li>
    </ul>
`;
const $ = cheerio.load(html);
console.log('$', $('.sh', '#foods').text()); */



// 属性
const html = `
    <ul id="foods">
        <li class="food sh">生蚝</li>
        <li class="food sb">扇贝</li>
        <li class="food ky">烤鱼</li>
    </ul>
    <input type="checkbox" checked />
    <input type="text" name="username" value="chd" class="user" />
`;
const $ = cheerio.load(html);
/* $('ul').attr('id', 'seafood').attr('class', 'seafoods');
$('ul').removeAttr('class');
console.log('属性attr', $('ul').attr('class'));
console.log('属性props', $('input[type="checkbox"]').prop('checked'));
console.log('输入框', $('input[name="username"]').val());
let hasClass = $('input[name="username"]').hasClass('user');
console.log('class', hasClass); */


// 查找元素  find   children
const li = $('#foods').find('li');
console.log('len', li.length);
const children = $('#foods').children('li');
console.log('childLen', children.length);