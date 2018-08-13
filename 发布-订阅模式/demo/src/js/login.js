import event from './event';

let login = {};

function installEvent(obj) {
    for (let i in event) {
        obj[i] = event[i];
    }
}

installEvent(login);

export default login;