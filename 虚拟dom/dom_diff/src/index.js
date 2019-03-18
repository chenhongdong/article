import { createElement, render } from './element';

let virtualDom = createElement('ul', { class: 'list' }, [
    createElement('li', { class: 'item' }, ['周杰伦']),
    createElement('li', { class: 'item' }, ['林俊杰']),
    createElement('li', { class: 'item' }, ['王力宏'])
]);

console.log(virtualDom);

let el = render(virtualDom);