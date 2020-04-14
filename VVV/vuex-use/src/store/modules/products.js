import shop from '@/api/shop';

// 初始化state
const state = {
    list: []
};

// getters
const getters = {};

// mutations
const mutations = {
    getList(state, products) {
        state.list = products;
    },
    // 去库存数量
    decrementProductInventory(state, {id}) {
        const product = state.list.find(item => item.id === id);
        product.inventory--;
    }
};

// actions
const actions = {
    async getList({commit}) {
        const products = await shop.getList();
        commit('getList', products);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};