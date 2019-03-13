import { createElement, render, renderDom } from './element';
import diff from './diff';

let virtualDom = createElement('ul', { class: 'list' }, [
    createElement('li', { class: 'item' }, ['a']),
    createElement('li', { class: 'item' }, ['b']),
    createElement('li', { class: 'item' }, ['c']),
]);

let virtualDom2 = createElement('ul', { class: 'list-group' }, [
    createElement('li', { class: 'item' }, ['1']),
    createElement('li', { class: 'item' }, ['b']),
    createElement('li', { class: 'item' }, ['3']),
]);

console.log(virtualDom);
// 将虚拟dom转化成了真实dom并渲染到页面
let el = render(virtualDom);
renderDom(el, window.root);
console.log(el);

let patch = diff(virtualDom, virtualDom2);