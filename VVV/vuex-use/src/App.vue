<template>
	<div id="app">
		<Swiper v-model="currentId" :autoplay="true" v-if="sliders.length">
			<template v-for="item in sliders">
				<SwiperItem :key="item.id" :id="item.id">
					<img :src="item.img" />
				</SwiperItem>
			</template>
		</Swiper>
	</div>
</template>

<script>
import Swiper from './components/Swiper/Swiper';
import SwiperItem from './components/Swiper/SwiperItem';
import shop from '@/api/shop';


export default {
	data() {
		return  {
			currentId: 1,
			sliders: [],
		}	
	},
	
	async mounted() {
		this.sliders = await shop.getAlbums();
	},
	components: {
		Swiper,
		SwiperItem
	}
}
</script>

<style>
* {
	margin: 0;
	padding: 0;
}
#app img {
	width: 100%;
	height: 220px;
}
</style>