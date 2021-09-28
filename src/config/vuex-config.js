import vuex from "vuex";
import Vue from "vue";
import axios from "axios";
import createPersistedState from "vuex-persistedstate";
import { TokenValidation } from "../plugins/utils.js";
import { StatusDecoder } from "../plugins/utils.js";
import { AccidentStatus } from "../plugins/utils.js";

Vue.use(vuex);

export const store = new vuex.Store({
  state: {
    loader: true,
    load_data: null,
    drawer: false,
    lines: [],
    addition: {},
    user: {},
    tokenJWT: "",
    pdc_variants: [],
    pkc_variants: [],
    vlc_variants: [],
  },
  mutations: {
    SET_PDC_VARIANTS: (state, payload) => {
      state.pdc_variants = payload;
    },
    SET_PKC_VARIANTS: (state, payload) => {
      state.pkc_variants = payload;
    },
    SET_VLC_VARIANTS: (state, payload) => {
      state.vlc_variants = payload;
    },
    TOGGLE_DRAWER: (state, payload) => {
      return (state.drawer = payload);
    },
    SET_LOAD_DATA: (state, payload) => {
      state.load_data = payload;
    },
    SET_STATUSES: (state, payload) => {
      state.statuses = payload;
    },
    SET_LINES: (state, payload) => {
      state.lines = payload;
    },
    SET_ADDITION: (state, payload) => {
      state.addition = payload;
    },
    SET_LOADER: (state, payload) => {
      state.loader = payload;
    },
    SET_USER: (state, payload) => {
      state.user = payload;
    },
    SET_TOKEN: (state, payload) => {
      localStorage.token = payload;
      state.tokenJWT = payload;
    },
    LOGOUT: (state) => {
      state.user = {};
      state.tokenJWT = "";
    },
    SET_ACCIDENTS: (state, payload) => {
      console.log(payload);
      for (let i = 0; i < state.lines.length; i++) {
        if (state.lines[i].key === payload.key) {
          state.lines[i].accidents = payload.accidents.sort((a, b) => b - a);
          state.lines[i].accidentStatus = payload.status;
        }
      }
    },
  },
  getters: {
    LOAD_PDC_VARIANTS: (state) => {
      return state.pdc_variants;
    },
    LOAD_PKC_VARIANTS: (state) => {
      return state.pkc_variants;
    },
    LOAD_VLC_VARIANTS: (state) => {
      return state.vlc_variants;
    },
    LOAD_DATA: (state) => {
      return state.load_data;
    },
    LOAD_LINES: (state) => {
      return state.lines;
    },
    LOAD_ADDITION: (state) => {
      return state.addition;
    },
    LOAD_LOADER: (state) => {
      return state.loader;
    },
    LOAD_AUTHENTICATION: (state) => {
      return TokenValidation(state.tokenJWT.token);
    },
    LOAD_USER: (state) => {
      return state.user;
    },
    LOAD_TOKEN: (state) => {
      return state.tokenJWT.token;
    },
  },
  actions: {
    TOGGLE_DRAWER: (context, payload) => {
      context.commit("TOGGLE_DRAWER", payload);
    },
    GET_LOAD_DATA: async (context) => {
      let { data } = await axios.get(
        "http://attp.kristal.local:5000/vue?c=" +
          context.getters.LOAD_USER.channels.slice(-1) +
          "&nz=" +
          context.getters.LOAD_USER.channels.slice(-1),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      var load = data.lines;
      var lines = [];
      var addition = {};
      var plan = Object.values(load);
      let key = Object.keys(load);
      for (var i = 0; i < plan.length; i++) {
        let accidents = [
          {
            id: 15435345,
            childs: [],
            time: ["08:40:51"],
            message: "",
            worker: "Мастер1",
          },
          {
            id: 28768467,
            childs: [],
            time: ["08:40:52"],
            message: "",
            worker: "Мастер1",
          },
          {
            id: 397686345634,
            childs: [],
            time: ["08:40:53"],
            message: "",
            worker: "Мастер1",
          },
          {
            id: 4876856734,
            childs: [],
            time: ["08:40:54"],
            message: "",
            worker: "Мастер1",
          },
          {
            id: 598798,
            childs: [],
            time: ["08:40:55"],
            message: "",
            worker: "Мастер1",
          },
          {
            id: 656443543,
            childs: [],
            time: ["08:40:56"],
            message: "",
            worker: "Мастер1",
          },
        ];
        let line_object = {
          line_id: key[i].slice(-1),
          key: key[i],
          status: StatusDecoder(plan[i].bitstatus),
          series: [
            {
              x: plan[i].plot_last
                ? plan[i].plot_last.boi["1"][0]
                : [Date.now()],
              y: plan[i].plot_last ? plan[i].plot_last.boi["1"][1] : [0],
              type: "scatter",
              line: { shape: "hv" },
              name: "Первый счетчик",
            },
            {
              x: plan[i].plot_last
                ? plan[i].plot_last.boi["2"][0]
                : [Date.now()],
              y: plan[i].plot_last ? plan[i].plot_last.boi["2"][1] : [0],
              type: "scatter",
              line: { shape: "hv" },
              name: "Второй счетчик",
            },
          ],
          layout: {
            showlegend: false,
            yaxis: { range: [0, 10000] },
            xaxis: { tickformat: "%H:%M:%S", type: "date" },
            shapes: [
              {
                type: "line",
                xref: "paper",
                x0: 0,
                y0: plan[i].plan ? plan[i].plan.avgspd : 6000,
                x1: 1,
                y1: plan[i].plan ? plan[i].plan.avgspd : 6000,
                line: {
                  color: "rgb(255, 0, 0)",
                  width: 4,
                  dash: "dot",
                },
              },
            ],
          },
          dialogTasks: false,
          dialogAccidents: false,
          accidents: accidents,
          accidentStatus: AccidentStatus(accidents),
          statusPv: plan[i].boi ? plan[i].boi["1"]["status-pv"] : 0,
          statusSp: plan[i].boi ? plan[i].boi["1"]["status-sp"] : 0,
        };
        if (plan[i].plan) {
          line_object.timetable = plan[i].plan.timetable;
        } else {
          line_object.product = plan[i].product;
        }
        lines.push(line_object);
      }
      addition.name = {
        department: data.dc,
        site: data.site
      }
      context.commit("SET_LOAD_DATA", data);
      context.commit("SET_LINES", lines);
      context.commit("SET_ADDITION", addition);
      context.commit("SET_LOADER", false);
    },
    GET_PRODUCTION_DATA: async(context, payload) => {
      let pdc = [] 
      let vlc = [] 
      let pkc = []
      let load = context.getters.LOAD_DATA.lines;
      let lines = Object.values(load);
      let keys = Object.keys(load);
      console.log(keys, lines)
      for (let i = 0; i < lines.length; i++) {
        if (keys[i] === payload) {
          let key =  Object.keys(lines[i].product);
          let value =  Object.values(lines[i].product);
          console.log(key, value);
          for (let j = 0; j < value.length; j++) {
            pdc.push({key: key[j], value: value[j][0].pdc})
            vlc.push({key: value[j][0].vol_val, value: value[j][0].vlc})
            pkc.push({key: value[j][0].pkc_val, value: value[j][0].pkc})
          }
        }
      }
      context.commit("SET_PDC_VARIANTS", pdc);
      context.commit("SET_PKC_VARIANTS", pkc);
      context.commit("SET_VLC_VARIANTS", vlc);
    },
    GET_LOAD_DATA_SINGLE_LINE: async (context, payload) => {
      let { data } = await axios.get(
        "http://172.17.0.162:5000/vue?c=" + context.getters.LOAD_USER.channels
      );
      let lines = context.getters.LOAD_LINES;
      for (let i = 0; i < data.lines.length; i++) {
        let key = Object.keys(data.lines[i])[0];
        if (key === payload) {
          for (let j = 0; lines.length; j++) {
            if (lines[i].key === payload) {
              let plan = Object.values(data.lines[i])[0];
              if (plan.plan) {
                let date = new Date();
                let time_1 = new Date(
                  date.getTime() - date.getTimezoneOffset() * 60000
                )
                  .toISOString()
                  .substr(11, 8);
                if (plan.boi) {
                  let time_stamp_1 = new Date(
                    parseInt(plan.boi["1"]["stats-ts"])
                  );
                  time_1 =
                    time_stamp_1.getHours() +
                    ":" +
                    time_stamp_1.getMinutes() +
                    ":" +
                    time_stamp_1.getSeconds();
                }
                lines[i] = {
                  line_id: plan.plan.lredkey.slice(-1),
                  key: plan.plan.lredkey,
                  timetable: plan.plan.timetable,
                  status: StatusDecoder(plan.bitstatus),
                  series: [
                    {
                      name: "Скорость линии в час",
                      data: [{ x: time_1, y: 0 }],
                    },
                  ],
                  options: {
                    chart: {
                      id: plan.plan.lredkey,
                      type: "line",
                      animations: {
                        enabled: true,
                        easing: "linear",
                        dynamicAnimation: {
                          enabled: true,
                          speed: 1000,
                        },
                      },
                      toolbar: {
                        show: false,
                      },
                      zoom: {
                        enabled: false,
                      },
                    },
                    annotations: {
                      yaxis: [
                        {
                          y: plan.plan.avgspd,
                          borderColor: "#C62828",
                          label: {
                            borderColor: "#C62828",
                            style: {
                              color: "#fff",
                              background: "#C62828",
                            },
                            text: "Плановая скорость",
                          },
                        },
                      ],
                    },
                    dataLabels: {
                      enabled: false,
                    },
                    stroke: {
                      curve: "smooth",
                    },
                    markers: {
                      size: 0,
                    },
                    xaxis: {
                      type: "category",
                    },
                    yaxis: {
                      min: 0,
                      max: 10000,
                    },
                    legend: {
                      show: false,
                    },
                  },
                };
              } else {
                let key = Object.keys(data.lines[i])[0];
                let line = Object.values(data.lines[i])[0];
                lines[i] = {
                  line_id: key.slice(-1),
                  key: key,
                  product: line.product,
                  status: StatusDecoder(line.bitstatus),
                };
              }
            }
          }
        }
      }
    },
    GET_STATUS: async (context, payload) => {
      let lines = context.getters.LOAD_LINES;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].key === payload.key) {
          lines[i].status = StatusDecoder(payload.status);
        }
      }
      context.commit("SET_LINES", lines);
    },
    LOGIN: async (context, payload) => {
      await axios
        .post("http://172.17.1.160:5050/login", payload, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((response) => {
          payload.name = response.data.name;
          payload.channels = response.data.channels;
          context.commit("SET_USER", payload);
          context.commit("SET_TOKEN", { token: response.data.token });
        })
        .catch((error) => {
          Vue.notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка авторизации!",
          });
          console.log("Auth error: ", error);
        });
    },
    LOGOUT: (context) => {
      context.commit("LOGOUT");
    },
  },
  plugins: [createPersistedState()],
});
