import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import axios from "axios";

import "./config/notification-config.js";
import "./config/vue-apex-charts-config.js";
import {store} from "./config/vuex-config.js";

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

Vue.config.productionTip = false;


new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
