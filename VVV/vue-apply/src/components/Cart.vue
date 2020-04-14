<template>
	<div class="cart" v-if="items.length">
		<h2>购物车</h2>
		<ul v-for="item in items" :key="item.id">
			<li>
				{{item.title}} X  {{item.quantity}}
			</li>
		</ul>
		<p>总价是：{{total}}</p>
	</div>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
	computed: {
		...mapGetters('cart', {
			items: 'getCartItems',
			total: 'totalPrice'
		})
	}
}
</script>