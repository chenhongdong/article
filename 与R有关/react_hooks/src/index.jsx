import React, { useState, useMemo, memo, useCallback } from 'react'
import { render } from 'react-dom'

// 父组件
function App() {
    const [num, setNum] = useState(0)
    const [song, setSong] = useState('夜曲')

    const data = useMemo(() => ({
        song,
        album: '11月的萧邦',
        poster: 'https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dd97ecf6827f48dc9b6fa79122733a64~tplv-k3u1fbpfcp-watermark.image'
    }), [song])

    // const changeSong = (e) => {
    //     setSong(e.target.value)
    // }
    const changeSong = useCallback((e) => {
        setSong(e.target.value)
    }, [song])


    console.log('App Render')
    return (
        <div>
            <p>{num}</p>
            <button onClick={() => setNum(num + 1)}>加一</button>
            <hr />
            {/* +++ 向子组件中传递函数changeSong */}
            <MemoMusic data={data} changeSong={changeSong} />
        </div>
    )
}

// 子组件
function Music({ data, changeSong }) {
    const { song, album, poster } = data
    console.log('Music Render')
    return (
        <div className="music">
            <input value={song} onChange={changeSong} />
            <p>{song}收录于专辑《{album}》</p>
            <img src={poster} width="100" height="100" />
        </div>
    )
}
const MemoMusic = memo(Music)


render(
    <App />,
    document.querySelector('#root')
)