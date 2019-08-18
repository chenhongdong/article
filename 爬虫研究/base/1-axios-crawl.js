// 

const axios = require('axios');
const url = 'https://follow-api-ms.juejin.im/v1/getUserFollowInfo?uid=585b9ec961ff4b0063e76dbe&src=web';

(async function() {
    let result = await axios.get(url);
    console.log(result.data);
})();