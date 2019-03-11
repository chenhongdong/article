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