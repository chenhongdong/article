import { createElement } from './element';

let virtualDom = createElement('ul', {class: 'list'}, [
    createElement('li', {class: 'item'}, ['阿里']),
    createElement('li', {class: 'item'}, ['腾讯']),
    createElement('li', {class: 'item'}, ['百度'])    
]);

console.log(virtualDom);