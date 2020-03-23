import shop from '@/api/shop';


// 初始化state
const state = {
    items: [],  // [{id,quantity}]
    checkoutStatus: null
};

// getters
const getters = {
    getCartItems(state, getters, rootState) {
        return state.items;
    },
    totalPrice(state, getters) {
        return state.items.reduce((total, item) => {
            return total + item.price * item.quantity;
        }, 0);
    }
};

// mutations
const mutations = {
    // 加入购物车
    addCart(state, product) {
        state.items.push({
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1
        });
    },
    // 设置状态
    setStatus(state, status) {
        state.checkoutStatus = status;
    },
    updateCart(state, {id}) {
        const product = state.items.find(item => item.id === id);
        product.quantity++;
    }
};

// actions
const actions = {
    addCart({commit,state}, goods) {
        // 设置当前状态
        commit('setStatus', null);
        const product = state.items.find(item => item.id === goods.id);
        // 如果商品没有添加到购物车数组中，那就添加到购物车
        // 否则就把存在的商品增加数量
        if (!product) { // product是undefined现在还没有添加到购物车，用传递过来的goods
            commit('addCart', goods);
        } else {
            commit('updateCart', {id: product.id});
        }
        // 添加到购物车后，要给商品去库存, {root: true}才可以访问全局的mutations或actions
        commit('products/decrementProductInventory', {id: goods.id}, {root: true});
    }
};


export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
};