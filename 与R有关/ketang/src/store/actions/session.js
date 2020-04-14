import * as types from '../action-types';
import { login, reg } from '@/api/session';
import { push } from 'react-router-redux';

export default {
    reg(body) {
        return function (dispatch, getState) {
            reg(body).then(payload => {
                dispatch({ type: types.SET_SESSION, payload });
                // 如果注册成功，跳到登录页登录
                // 如果注册失败，重新填写提交
                if (!payload.error) {
                    // dispatch(push('/login'));
                }
            });
        }
    },
    login(body) {
        return function(dispatch, getState) {
            login(body).then(payload => {
                dispatch({type: types.SET_SESSION, payload});

                if (!payload.error) {
                    // dispatch(push('/profile'));
                }

            });
        }
    }
}