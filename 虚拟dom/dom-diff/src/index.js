import { createElement, render, renderDom } from './element';
import diff from './diff';
import patch from './patch';

let virtualDom = createElement('ul', { class: 'list' }, [
    createElement('li', { class: 'item' }, ['a']),
    createElement('li', { class: 'item' }, ['b']),
    createElement('li', { class: 'item' }, ['c'])
]);

let virtualDom2 = createElement('ul', { class: 'list-group' }, [
    createElement('li', { class: 'item' }, ['1']),
    createElement('li', { class: 'item' }, ['b']),
    createElement('p', {class: 'page'}, [
        createElement('a', {class:'link', href: 'https://www.so.com/', target: '_blank'}, ['so'])
    ]),
    createElement('li', {class: 'wkk'}, ['wkk'])
]);


// 如果平级元素有互换，那会导致重新渲染
// 新增节点也不会被更新



// 将虚拟dom转化成了真实dom并渲染到页面
let el = render(virtualDom);
renderDom(el, window.root);

let patches = diff(virtualDom, virtualDom2);
console.log(patches);

// 给元素打补丁，重新更新视图
patch(el, patches);