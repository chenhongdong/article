import React, { Component } from 'react';
import NavHeader from '@/components/NavHeader';
import './index.less';
import { Link } from 'react-router-dom';
import actions from '@/store/actions/session';
import {connect} from 'react-redux';
import Alert from '@/components/Alert';


@connect(
    state => state.session,
    actions
)
export default class Login extends Component {

    handleReg = (event) => {
        let username = this.username.value;
        let password = this.password.value;
        this.props.login({ username, password });
    }

    render() {
        const {success, error } = this.props;

        return (<div className="login">
            <NavHeader title="登录" />
            <div className="login-bg">
                <img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1555864316456&di=0c87f83e54699822ba850e8d9392c9df&imgtype=0&src=http%3A%2F%2Fhbimg.b0.upaiyun.com%2F5cfa26824f7bd9c98357b1995df832031b2377a45947-Wg5Plo_fw658" />
            </div>
            <input type="tel" placeholder="手机号" ref={ref => this.username = ref} />
            <input type="password" placeholder="密码" ref={ref => this.password = ref} />
            <Link to="/login">前往注册</Link>
            <button onClick={this.handleReg}>登录</button>
            {
                success || error ? (
                    <Alert 
                        type={success ? 'success' : 'error'}
                        message={success || error} />
                ) : null
            }
            
        </div>)
    }
}