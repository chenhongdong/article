import { get, post } from './index';

export function getSliders() {
    return get('/getSliders');
}

export function getLessons(category, offset, limit) {
    return get(`/getLessons/${category}?offset=${offset}&limit=${limit}`);
}