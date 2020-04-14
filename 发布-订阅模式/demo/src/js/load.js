import axios from 'axios';
import login from './login';

function load() {
    // $.ajax({
    //     // url: 'http://musicapi.leanapp.cn/search?keywords=任贤齐',
    //     url: './data.json',
    //     // dataType: 'json',
    //     success: function(data) {
    //         login.trigger('loginSucc', data);
    //     }
    // });

    axios.get('http://localhost:4000/data.json')
         .then(res => {
            console.log(res);
         })
}

export default load;