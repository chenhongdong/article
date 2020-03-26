import axios from 'axios';
axios.interceptors.response.use(res => res.data);

export default {
    async getList() {
        let { data } = await axios.get('/api/getlist');
        return data;
    },
    async buyProducts(products, cb, errCb) {
        let {code} = await axios.post('/api/buyproducts', products);
        code === 0 ? cb() : errCb();
    },
    async getAlbums() {
        let {data} = await axios.get('/api/getalbums');
        return data;
    }
}