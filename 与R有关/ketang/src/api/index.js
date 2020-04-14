
const HOST = 'http://localhost:3000';

export function get(url) {
    // json方法是把响应体转成json
    return fetch(HOST + url).then(res => res.json());
}

export function post(url, data) {
    return fetch(HOST + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Acceot': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}