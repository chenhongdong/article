import React, { Component } from 'react';
import pathToRegExp from 'path-to-regexp';
import { Consumer } from './context';

// Switch是用来匹配一次，匹配之后就不再找了
export default class Switch extends Component {
    render() {
        return (<Consumer>
            {state => {
                let pathname = state.location.pathname;
                let children = this.props.children;

                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    let path = child.props.path || '';  // redirect没有path属性需要给个''
                    let reg = pathToRegExp(path, [], { end: false });

                    if (reg.test(pathname)) {   // switch匹配成功
                        return child;   // 返回匹配到的组件即可   
                    }
                }
                return null;
            }}
        </Consumer>)
    }
}