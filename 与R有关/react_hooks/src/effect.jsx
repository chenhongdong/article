import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { render } from 'react-dom'



function Counter(props) {
    const [number, setNumber] = useState(0)

    useEffect(() => {
        console.log('开启定时器')
        const timer = setInterval(() => {
            // 除了直接传新状态，也可以传个函数基于老状态返回新状态
            setNumber(number => number + 1)
        }, 1000)


        return () => {
            clearInterval(timer)
            console.info('清除定时器')
        }
    })      // deps[]是一个要依赖的变量，可以是const定义的变量，也可以是useState定义的变量

    return <div>
        {number}
    </div>
}


function Animation(props) {
    const domRef = useRef()
    const style = {
        width: 200,
        height: 200,
        borderRadius: '50%',
        backgroundColor: '#0cc'
    }

    // 会执行过渡动画的过程
    useEffect(() => {
        domRef.current.style.transform = 'translateX(500px)'
        domRef.current.style.transition = '1s'
    })

    // 相当于直接DOM已经渲染好，就不会执行动画过程
    // useLayoutEffect(() => {
    //     domRef.current.style.transform = 'translateX(500px)'
    //     domRef.current.style.transition = '1s'
    // })






    return (
        <div style={style} ref={domRef}></div>
    )
}


render(
    <Animation />,
    document.getElementById('root')
)