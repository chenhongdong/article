import login from './login';

let list = {
    render() {
        login.listen('loginSucc', data => {
            console.log('list');
            console.log(data);
        });
    }
}



export default list;