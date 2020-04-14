import React, { Component } from 'react';
import { Link, Route } from './react-router-dom';
import UserAdd from './UserAdd';
import UserList from './UserList';
import UserDetail from './UserDetail';

export default class User extends Component {
    render() {
        return (<div>
            <div>
                <Link to="/user/add">用户添加</Link>
                <Link to="/user/list">用户列表</Link>
            </div>
            <div>
                <Route path="/user/add" component={UserAdd}></Route>
                <Route path="/user/list" component={UserList}></Route>
                <Route path="/user/detail/:id" component={UserDetail}></Route>
            </div>
        </div>)
    }
}