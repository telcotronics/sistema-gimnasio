import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from './plugins/Vuetify'
import '@mdi/font/css/materialdesignicons.css'
import './assets/global.css'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  vuetify,
  components: { App },
  template: '<App/>'
})
