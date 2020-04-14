import React, { Component } from 'react';
import { Consumer } from './context';

export default class Redirect extends Component {
    render() {
        return <Consumer>
            {state => {
                // 重定向的目的就是匹配不到直接跳转到redirect的路径中
                state.history.push(this.props.to);
                return null;
            }}
        </Consumer>;
    }
}