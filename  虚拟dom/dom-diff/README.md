## 生成项目
```
npm i create-react-app -g
create-react-app dom-diff
```

## 虚拟dom
createElement => {type, props, children}

## DOM Diff
DOM Diff比较两个虚拟dom的区别，就是比较两个对象的区别
作用：根据两个虚拟对象创建出补丁，描述改变的内容，将这个补丁用来更新dom

## 差异计算
先序深度优先遍历
1. 用js对象模拟DOM
2. 把此虚拟DOM转成真实DOM并插入页面中
3. 如果有事件发生修改了虚拟DOM，比较两棵虚拟DOM树的差异，得到差异对象
4. 把差异对象应用到真正的DOM树上

### 比较规则
- 当节点类型相同时，去看一下属性是否相同，产生一个属性的补丁包{type:'ATTRS', attrs:{class:'list-group'}}
- 新的DOM节点不存在{type:'REMOVE', index: xxx}
- 节点类型不相同 直接采用替换模式{type:'REPLACE', newNode: newNode}
- 文本的变化{type:'TEXT', text: 1}