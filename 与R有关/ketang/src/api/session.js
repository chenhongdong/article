import {get, post} from './index';

export function login(body) {
    return post('/login', body)
}

export function reg(body) {
    return post('/reg', body);
}