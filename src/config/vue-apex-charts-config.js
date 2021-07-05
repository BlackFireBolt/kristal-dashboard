import Vue from "vue";
import VueApexCharts from 'vue-apexcharts'
import {Plotly} from "vue-plotly"
Vue.use(VueApexCharts)
Vue.use(Plotly)
Vue.component('plotly', Plotly)
Vue.component('apexchart', VueApexCharts)