import { createElement, render, renderDom } from './element';
import diff from './diff';
import patch from './patch';

let virtualDom = createElement('ul', { class: 'list' }, [
    createElement('li', { class: 'item' }, ['周杰伦']),
    createElement('li', { class: 'item' }, ['林俊杰']),
    createElement('li', { class: 'item' }, ['王力宏'])
]);

let virtualDom2 = createElement('ul', { class: 'list-group' }, [
    createElement('li', { class: 'item' }, ['Jay Chou']),
    createElement('li', { class: 'item' }, ['JJ']),
    createElement('li', { class: 'item' }, ['王力宏'])
]);

let el = render(virtualDom);

// 渲染出真实的dom
renderDom(el, window.root);

// 补丁
let patches = diff(virtualDom, virtualDom2);
console.log(patches);

patch(el, patches);