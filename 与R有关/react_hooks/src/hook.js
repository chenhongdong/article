

// 保存hook状态值的数组
let hookStates = []
let hookIndex = 0
let scheduleUpdate


function render() {
    // 加载dom

    scheduleUpdate = () => {
        hookIndex = 0
        // 比较两个vdom
    }
}


export function useState(initialState) {
    // 有值的话就取对应的值，没有就取初始值
    hookStates[hookIndex] = hookStates[hookIndex] || initialState
    let currentIndex = hookIndex

    function setState(newState) {
        hookStates[currentIndex] = newState

        scheduleUpdate()
    }

    return [hookStates[hookIndex++], setState]

    // 源码内部useState是直接用useReducer实现的
    // return useReducer(null, initialState)
}


export function useMemo(factory, deps) {
    // 先判断有没有老值
    if (hookStates[hookIndex]) {
        let [oldMemo, oldDeps] = hookStates[hookIndex]
        // 判断依赖数组的每一个元素 和 老的依赖数组中的每一个元素 是否相同
        let same = deps && deps.every((dep, i) => dep === oldDeps[i])
        if (same) {
            hookIndex++
            return oldMemo
        } else {
            let newMemo = factory()
            hookStates[hookIndex++] = [newMemo, deps]
            return newMemo
        }
    } else {
        let newMemo = factory() // { number }
        hookStates[hookIndex] = [newMemo, deps]
        return newMemo
    }
}


export function useCallback(callback, deps) {
    if (hookStates[hookIndex]) {
        const [oldCallback, oldDeps] = hookStates[hookIndex]
        const same = deps && deps.evety((dep, i) => dep === oldDeps[i])
        if (same) {
            hookIndex++
            return oldCallback
        } else {
            hookStates[hookIndex++] = [callback, deps]
            return callback
        }
    } else {
        hookStates[hookIndex] = [callback, deps]
        return callback
    }
}


export function useReducer(reducer, initialState) {
    hookStates[hookIndex] = hookStates[hookIndex] || initialState
    const currentIndex = hookIndex
    function dispatch(action) {

        /*
        // 判断传递进来的是不是一个函数，如果是函数的话执行并返回新状态
        let newState = typeof action === 'function' ? action(hookStates[currentIndex]) : hookStates[currentIndex]
        // 三元处理useState兼容，reducer存在就用调用reducer返回新状态，不存在就直接用newState(状态or行为)赋值过去
        hookStates[currentIndex] = reducer ? reducer(newState, action) : newState
        */

        // 1. 获取老状态
        const oldState = hookStates[currentIndex]
        // 2. 如果有reducer就使用reducer计算新状态
        if (reducer) {
            const newState = reducer(oldState, action)
            hookStates[currentIndex] = newState
        } else {    // 3. 没有reducer就走action
            // 判断action是不是函数，如果是就传入老状态，计算新状态
            const newState = typeof action === 'function' ? action(oldState) : action
            hookStates[currentIndex] = newState
        }
        // 更新
        scheduleUpdate()
    }
    return [hookStates[hookIndex++], dispatch]
}


export function useContext(context) {
    return context._currentValue
}


export function useEffect(callback, deps) {
    const currentIndex = hookIndex
    if (hookStates[hookIndex]) {
        const [oldDestory, oldDeps] = hookStates[hookIndex]
        const same = deps && deps.every((dep, i) => dep === oldDeps[i])
        if (same) {
            hookIndex++
        } else {
            oldDestory && oldDestory()
            setTimeout(() => {
                const destory = callback()
                hookStates[currentIndex] = [destory, deps]
            })
            hookIndex++
        }
    } else {
        // 开启一个新的宏任务
        setTimeout(() => {
            // 执行callback函数，返回一个销毁函数
            const destory = callback()
            hookStates[currentIndex] = [destory, deps]
        })
        hookIndex++
    }
}


export function useLayoutEffect(callback, deps) {
    const currentIndex = hookIndex
    if (hookStates[hookIndex]) {
        const [oldDestory, oldDeps] = hookStates[hookIndex]
        const same = deps.every((dep, i) => dep === oldDeps[i])

        if (same) {
            hookIndex++
        } else {
            oldDestory && oldDestory()
            queueMicrotask(() => {
                const destory = callback()
                hookStates[hookIndex] = [destory, deps]
            })
            hookIndex++
        }

    } else {
        // 加入到微任务队列中，queueMicrotask方法是window的API
        queueMicrotask(() => {
            const destory = callback()
            hookStates[currentIndex] = [destory, deps]
        })
        hookIndex++
    }
}


export function useRef(initialState) {
    hookStates[hookIndex] = hookStates[hookIndex] || { current: initialState }
    return hookStates[hookIndex]
}

export function useImperativeHandle(ref, factory) {
    ref.current = factory()
}