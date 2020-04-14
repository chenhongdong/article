import { createElement, render, renderDom } from './element';
import diff from './diff';
import patch from './patch';


let virtualDom = createElement('ul', { class: 'list', style: 'list-style: none;' }, [
    createElement('li', {class:'item'}, ['周杰伦']),
    createElement('li', {class: 'item'}, ['林俊杰']),
    createElement('li', {class:'item'}, ['王力宏'])
]);

let virtualDom2 = createElement('ul', { class: 'list-group', style: 'color: red;' }, [
    createElement('li', {class:'item'}, ['周杰伦']),
    createElement('li', {class: 'item'}, ['林俊杰']),
    createElement('li', {class:'item', style: 'color: skyblue'}, ['朴树'])
]);

let el = render(virtualDom);
console.log(el);

renderDom(el, window.root);

let patches = diff(virtualDom, virtualDom2);

console.log(patches);

patch(el, patches);