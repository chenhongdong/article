import React, { Component } from 'react';
import { Consumer } from './context';
import pathToRegExp from 'path-to-regexp';

export default class Route extends Component {
    render() {
        return <Consumer>
            {/* 里面放的是一个函数 */}

            {state => {
                // path是Route中传递的
                // exact表示是严格匹配
                let { path, component:Component, exact=false } = this.props;
                // pathname是location中的
                let pathname = state.location.pathname;

                // 根据path通过正则匹配  path-to-regexp包
                let keys = [];
                let reg = pathToRegExp(path, keys, { end: exact });
                keys = keys.map(item => item.name); // [id];
                let result = pathname.match(reg);
                let [url, ...values] = result || [];      // [1]

                let props = {
                    location: state.location,
                    history: state.history,
                    match: {
                        params: keys.reduce((obj, current, index) => {
                            obj[current] = values[index];
                            return obj;
                        }, {})
                    }
                };

                if (result) {
                    return <Component {...props}></Component>
                }
                return null;
            }}
        </Consumer>
    }
}