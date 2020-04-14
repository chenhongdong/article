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

### element
- 创建一个Element类，构造函数接收type, props以及children三个参数
- createElement方法直接返回Element类的实例并且导出该方法
- render方法可以将vNode转化成真实dom
    - 接收一个dom对象，通过dom对象的类型来亲自创建一个元素
    - for in遍历该dom对象上的props并且给该元素设置属性setAttr
    - 遍历子节点，如果子节点也是Element的实例，那就给子节点递归调用render方法；反之就说明子节点是个文本节点，通过createTextNode来创建一个文本节点就可以了。
    - 最后把子节点添加到创建出的元素中，返回该元素
- setAttr方法是给元素设置属性的
    - switch去判断key的值
        - value
            有两种标签带有这样的属性，input和textarea
            如果是这两种那就直接将value值赋给它的value上
            如果不是那就直接调用setAttribute来设置key和value
        - style
            style属性就可以直接通过cssText来赋值了
        - 其他默认的就直接setAttribute设置即可了
- renderDom将元素插入到页面内
- 最后将上述方法通通导出供其他组件使用

### diff
- diff方法对比oldTree和newTree
```
function diff(oldTree, newTree) {
    // 声明变量patches用来存放补丁的对象
    let patches = {};
    // 第一次比较是从树的第0位索引开始
    let index = 0;
    // 递归树 比较后的结果放到补丁内
    walk(oldTree, newTree, index, patches);

    // 返回收集到的大补丁
    return patches;
}
```
- walk方法是个关键先生
```
/* 
    每个元素都有一个补丁，所以需要创建一个放当前补丁的数组

        如果没有new节点的话，就直接将type为REMOVE的类型放到当前补丁里

        如果新老节点是文本的话，判断一下文本是否一致，再指定类型TEXT并把新节点放到当前补丁

        如果新老节点的类型相同，那么就来比较一下他们的属性props
            然后如果有子节点的话就再比较一下子节点的不同，再调一次walk

        上面三个如果都没有发生的话，那就表示节点单纯的被替换了，type为REPLACE，直接用newNode

    当前补丁里确实有值的情况，就将对应的补丁放进大补丁包里
*/
```
    - diffAttr
        - 去比较新老Attr是否相同
        - 把newAttr的键值对赋给patch对象上并返回此对象
    - diffChildren
        - 遍历oldChildren，然后递归调用walk再通过child和newChildren[index]去diff
    



### patch
- 用一个变量来得到传递过来的所有补丁allPatches
- patch方法接收两个参数(node, patches)
    - 在方法内部调用walk方法，给某个元素打上补丁
- walk方法里获取所有的子节点
    - 给子节点也进行先序深度优先遍历，递归walk
    - 如果当前的补丁是存在的，那么就对其进行打个补丁(doPatch)
- doPatch打补丁方法会根据传递的patches进行遍历
    - 判断补丁的类型来进行不同的操作
        1. 属性ATTRS
            for in去遍历attrs对象，当前的key值如果存在，就直接设置属性setAttr； 如果不存在对应的key值那就直接删除这个key键的属性
        2. 文字TEXT
            直接将补丁的text赋值给node节点的textContent即可
        3. 替换REPLACE
            新节点替换老节点，需要先判断新节点是不是Element的实例，是的话调用render方法渲染新节点；不是的话就表明新节点是个文本节点，直接创建一个文本节点就OK了。
            之后再通过调用父级parentNode的replaceChild方法替换为新的节点
        4. 删除REMOVE
            直接调用父级的removeChild方法删除该节点
- 将patch方法默认导出方便调用
