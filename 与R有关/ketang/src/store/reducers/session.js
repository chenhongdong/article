import * as types from '../action-types';

const initState = {
    user: null,     // 用户信息
    success: null,  // 成功的提示
    error: null     // 失败的提示
};

export default function(state = initState, action) {
    switch(action.type) {
        case types.SET_SESSION:
            return action.payload;
        default:
            return state;
    }

    return state;
}