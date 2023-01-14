import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { render } from 'react-dom'
// 父组件
function Parent() {
    const [number, setNumber] = useState(0)
    const inpRef = useRef()
    const getFocus = () => {
        inpRef.current.focus()
        // remove方法子组件的ref引用里没有暴露出来，所以就会报错
        // 防止父组件误操作子组件
        inpRef.current.remove()
    }

    return <div>
        <ForwardedChild ref={inpRef} />
        <button onClick={getFocus}>获取焦点</button>
        <p>{number}</p>
        <button onClick={() => setNumber(number + 1)}>自增</button>
    </div>
}
// 子组件
function Child(props, ref) {
    const childRef = useRef()
    useImperativeHandle(ref, () => ({   // 工厂函数返回一个对象
        focus() {
            childRef.current.focus()
        }
    }))

    return <input ref={childRef} />
}
// 转发ref，被转发的组件接受props和ref
const ForwardedChild = forwardRef(Child)


render(
    <Parent />,
    document.querySelector('#root')
)