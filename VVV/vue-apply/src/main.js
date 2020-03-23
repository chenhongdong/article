import Vue from 'vue'
import App from './App.vue'
import store from './store'

import directives from './directives';
// 注册全局指令
Vue.use(directives);

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
