import React, { Component } from 'react';
import { Provider } from './context';

export default class HashRouter extends Component {
    constructor() {
        super();
        this.state = {
            location: {
                pathname: window.location.hash.slice(1) || '/',  // 不要#直接截取掉
            }
        };
    }
    componentDidMount() {
        // 默认hash没有时跳转到/
        window.location.hash = window.location.hash || '/';
        // 监听Hash值变化，重新设置状态
        window.addEventListener('hashchange', () => {
            this.setState({
                location: {
                    ...this.state.location,
                    pathname: window.location.hash.slice(1) || '/'
                }
            });
        });
    }
    render() {
        let value = {
            location: this.state.location,
            history: {
                push(to) {
                    window.location.hash = to;
                }
            }
        };

        // Provider上的value是固定的，用来传值
        return (<Provider value={value}>
            {this.props.children}
        </Provider>)
    }
}