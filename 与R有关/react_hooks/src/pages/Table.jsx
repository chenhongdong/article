import React from "react";
import useRequest from '../hooks/useRequest'

// 请求的接口
const URL = 'http://localhost:9001/api/users'

/**
 * 
 * @returns useRequest 自定义hook  用来请求远程接口，用来实现分页数据的获取
 */
function Table() {
    const [data, options, setOptions] = useRequest(URL)


    return (
        <>
            <table>
                <thead>
                    <tr>
                        <td>Id</td>
                        <td>Name</td>
                    </tr>
                </thead>
                <tbody>

                </tbody>
            </table>
        </>
    )
}


export default Table