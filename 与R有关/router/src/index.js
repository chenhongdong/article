import React, { Component } from 'react';
import { render } from 'react-dom';
import { HashRouter as Router, Route, Link, Redirect, Switch} from './react-router-dom';

// 导入组件
import Home from './Home';
import Profile from './Profile';
import User from './User';


export default class App extends Component {
    render() {
        return (<Router>
            <div>
                <div>
                    <Link to="/home">首页</Link>
                    <Link to="/profile">个人中心</Link>
                    <Link to="/user">用户</Link>
                </div>
                <div>
                    <Switch>
                        <Route path="/home/123" component={Home}></Route>
                        <Route path="/home" exact={true} component={Home}></Route>
                        <Route path="/profile" component={Profile}></Route>
                        <Route path="/user" component={User}></Route>
                        <Redirect to="/home"></Redirect>
                    </Switch>
                </div>
            </div>
        </Router>)
    }
}

render(<App></App>, window.root);