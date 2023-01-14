# 常用的hooks有哪些？

## useState

## useMemo

## useCallback

## useReducer

## useContext
- 接收一个`context`对象(React.createContext返回值)，并返回该context的当前值
- 当前context值是由上层组件中距离当前组件最近的`<MyContext.Provider value={value}>`的value值决定
- 当`<MyContext.Provider>`更新时，该hook会触发重新渲染，并把最新的value值传给当前context
- useContext(MyContext)相当于 class 组件中的 `static contextType = MyContext` 或者 `<MyContext.Consumer>`


## useEffect


## useLayoutEffect
- 在所有的`DOM`变更后同步调用effect
- `useEffect`不会阻塞浏览器渲染，而`useLayoutEffect`会阻塞浏览器渲染
- `useEffect`会在浏览器渲染结束后执行，`useLayoutEffect`则是在DOM更新完成后，浏览器渲染前执行


## useRef


## forwardRef + useImperativeHandle
- forwardRef将ref从父组件中转发到子组件中的dom元素上，子组件接收props和ref作为参数
- useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值


# hooks的优点
1. 可以抽离公共方法和逻辑，提高代码的复用性
2. 函数式组件更简洁，开发效率更高 



参考： 
http://zhufengpeixun.com/strong/html/69-hooks.html#t95.1%20%E4%BD%BF%E7%94%A8
   
http://zhufengpeixun.com/strong/html/62.5.react-hooks.html#t104.5.2%20%E5%87%8F%E5%B0%91%E6%B8%B2%E6%9F%93%E6%AC%A1%E6%95%B0
   
http://zhufengpeixun.com/strong/html/106.2.react_hooks.html#t53.useCallback+useMemo
   
   
https://note.youdao.com/ynoteshare/index.html?id=990b8708b2a42cd108ed7d2b2c2eb9c7&type=notebook&_time=1659619028087?saveFolder#/1D9F51E71676414A9D0B90E9F9C90EDE






