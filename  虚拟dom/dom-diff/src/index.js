import { createElement, render, renderDom } from './element';

let virtualDom = createElement('ul', { class: 'list' }, [
    createElement('li', { class: 'item' }, ['a']),
    createElement('li', { class: 'item' }, ['b']),
    createElement('li', { class: 'item' }, ['c']),
]);

console.log(virtualDom);
// 将虚拟dom转化成了真实dom并渲染到页面
let el = render(virtualDom);
renderDom(el, window.root);
console.log(el);