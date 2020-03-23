<template>
    <ul class="products">
        <li v-for="item in list" :key="item.id">
            {{item.title}} - {{item.price | currency}}
            <p><button @click="addCart(item)" :disabled="!item.inventory">加入购物车</button></p>
        </li>
    </ul>
</template>

<script>
import {mapState, mapActions} from 'vuex';

export default {
    created() {
        this.$store.dispatch('products/getList');
    },
    computed: {
        ...mapState({
            list: state => state.products.list
        })
    },
    methods: {
        ...mapActions('cart', [
            'addCart'
        ])
    },
    filters: {
        currency(val) {
            if (!val) return '';
            return '￥' + val;
        }
    }
}
</script>