import React, { Component } from 'react';
import './index.less';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

@connect(
    state => state.session,
)
export default class Profile extends Component {
    render() {
        return (<div className="profile">
            <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1555864316456&di=0c87f83e54699822ba850e8d9392c9df&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F5cfa26824f7bd9c98357b1995df832031b2377a45947-Wg5Plo_fw658" />
            {
                this.props.user ? <a>{this.props.user.username}</a> : <Link to="/login">登录</Link>
            }
        </div>)
    }
}