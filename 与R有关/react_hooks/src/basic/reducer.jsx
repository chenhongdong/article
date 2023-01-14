import React, { useReducer } from "react";
import { render } from 'react-dom'

// useReducer是useState的替代方案
const inititalState = { count: 0 }

function reducer(state = inititalState, action) {
    switch (action.type) {
        case 'ADD':
            return { count: state.count + 1 }
        case 'MINUS':
            return { count: state.count - 1 }
        default:
            return state
    }
}

function init(inititalState) {
    return { count: inititalState.count }
}


function App() {
    const [state, dispatch] = useReducer(reducer, inititalState, init)

    return (
        <div>
            <p>{state.count}</p>
            <button onClick={() => dispatch({ type: 'ADD' })}>加一</button>
            <button onClick={() => dispatch({ type: 'MINUS' })}>减一</button>
            <button onClick={() => dispatch({ type: 'RESET', payload: ini })}>重置</button>
        </div>
    )
}

render(
    <App  />,
    document.querySelector('#root')
)