import React, { createContext, memo, useCallback, useContext, useMemo, useReducer, useState } from "react";
import { render } from 'react-dom'


function Child({ data, handleClick }) {
    console.log('Child render');
    return (
        <button onClick={handleClick}>{data.number}</button>
    )
}
// 第一步需要用memo包裹函数组件，进行缓存
const MemoChild = memo(Child)

// 函数组件+hooks
function App() {
    const [number, setNumber] = useState(0)
    const [name, setName] = useState('小白')
    // 第二步使用useMemo缓存数据，使用useCallback缓存函数

    // 希望data在App组件重新渲染的时候，如果number变了就变成新的data
    // 如果number没变，就返回老的data
    let data = useMemo(() => ({ number }), [number])
    // 希望handleClick在App组件重新渲染的时候，如果number变了，就返回新handleClick
    // 如果number没变，就返回老handleClick
    const handleClick = useCallback(() => setNumber(number + 1), [number])
    console.log('App render');
    return (
        <div>
            <input value={name} onChange={e => setName(e.target.value)} />
            <MemoChild data={data} handleClick={handleClick} />
        </div>
    )
}





// useReducer使用
function reducer(state = { count: 0 }, action) {
    switch (action.type) {
        case 'ADD':
            return { count: state.count + 1 }
        case 'MINUS':
            return { count: state.count - 1 }
        default:
            return state
    }
}
function Counter() {
    // const [state, dispatch] = useReducer(reducer, { count: 0 })
    const {state, dispatch} = useContext(CounterContext)

    return (
        <div>
            <p>{state.count}</p>
            <button onClick={() => dispatch({ type: 'ADD' })}>增加</button>
            <button onClick={() => dispatch({ type: 'MINUS' })}>减少</button>
        </div>
    )
}


// useContext使用
const CounterContext = createContext()

function Main() {
    const [state, dispatch] = useReducer(reducer, { count: 0 })

    return (
        <CounterContext.Provider value={{ state, dispatch }}>
            <Counter />
        </CounterContext.Provider>
    )
}


render(
    <Main />,
    document.querySelector('#root')
)