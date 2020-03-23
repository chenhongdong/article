<template>
	<div id="app">
		<!-- 获取用户选择的数据 -->
		<Cascader :options.sync="options" v-model="value" :lazyload="lazyload"></Cascader>
	</div>
</template>

<script>
import Cascader from './components/Cascader/Cascader';
import cityList from './api/city.json';

// 模拟请求，通过pid去查找
const fetchData = (pid) => {
	return new Promise((resolve, reject) => {
		setTimeout(() =>{
			resolve(cityList.filter(item => item.pid == pid));
		}, 1000);
	});
}


export default {
	data() {
		return  {
			value: [],
			options: []
		}	
	},
	async mounted() {
		// 先取第一层的数据
		this.options = await fetchData(0);
	},
	methods: {
		async lazyload(id, callback) {	// 你需要传入一个方法，第一个参数是你选中的id，第二参数是回调
			let children = await fetchData(id);
			callback(children);
		},
		// async input(val) {
		// 	let current = val[val.length - 1];	// 当前点击的那项
		// 	let children = await fetchData(current.id);
		// 	console.log(children);
		// 	this.$set(current, 'children', children);
		// }
	},
	components: {
		Cascader
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