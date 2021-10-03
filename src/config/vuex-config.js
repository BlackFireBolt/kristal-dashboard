import vuex from "vuex";
import Vue from "vue";
import axios from "axios";
import { TokenValidation } from "../plugins/utils.js";
import { StatusDecoder } from "../plugins/utils.js";
import { AccidentStatus } from "../plugins/utils.js";
import createPersistedState from "vuex-persistedstate";

Vue.use(vuex);

const dataState = createPersistedState({
  reducer: (state) => {
    return {
      tokenJWT: state.tokenJWT,
      user: state.user,
    };
  },
});

export const store = new vuex.Store({
  state: {
    loader: true,
    load_data: [],
    drawer: false,
    lines: [],
    utils: [],
    user: {},
    tokenJWT: "",
    pdc_variants: [],
    pkc_variants: [],
    vlc_variants: [],
  },
  mutations: {
    SET_UTILS: (state, payload) => {
      state.utils.push(payload);
    },
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
      state.load_data.push(payload);
    },
    SET_STATUSES: (state, payload) => {
      state.statuses = payload;
    },
    SET_LINES: (state, payload) => {
      state.lines.push(payload);
    },
    UPDATE_LINES: (state, payload) => {
      state.lines = payload;
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
        for (let j = 0; j < state.lines[i].length; j++) {
          if (state.lines[i][j].key === payload.key) {
            state.lines[i][j].accidents = payload.accidents.sort(
              (a, b) => b - a
            );
            state.lines[i][j].accidentStatus = payload.status;
          }
        }
      }
    },
  },
  getters: {
    LOAD_UTILS: (state) => {
      return state.utils;
    },
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
    GET_LOAD_DATA: async (context, payload) => {
      let { data } = await axios.get(
        "http://attp.kristal.local:5000/vue?c=" + payload + "&nz=1",
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      var load = data.lines;
      var lines = [];
      let utils = {};
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
                ? plan[i].plot_last.boi["1"]
                  ? plan[i].plot_last.boi["1"][0]
                  : [Date.now()]
                : [Date.now()],
              y: plan[i].plot_last
                ? plan[i].plot_last.boi["1"]
                  ? plan[i].plot_last.boi["1"][1]
                  : [0]
                : [0],
              type: "scatter",
              line: { shape: "hv" },
              name: "Акцизный счетчик",
            },
            {
              x: plan[i].plot_last
                ? plan[i].plot_last.boi["2"]
                  ? plan[i].plot_last.boi["2"][0]
                  : [Date.now()]
                : [Date.now()],
              y: plan[i].plot_last
                ? plan[i].plot_last.boi["2"]
                  ? plan[i].plot_last.boi["2"][1]
                  : [0]
                : [0],
              type: "scatter",
              line: { shape: "hv" },
              name: "Разливной счетчик",
            },
          ],
          info: plan[i].boi
          ? [
            {
              bid: plan[i].boi["1"]
                  ? plan[i].boi["1"].bid
                  : null
                ,
              info: plan[i].boi["1"]
                  ? plan[i].boi["1"].info
                    ? plan[i].boi["1"].info
                    : null
                  : null
                ,
            },
            {
              bid:  plan[i].boi["2"]
                  ? plan[i].boi["2"].bid
                  : null
                ,
              info: plan[i].boi["2"]
                  ? plan[i].boi["2"].info
                    ? plan[i].boi["2"].info
                    : null
                  : null
                ,
            },
          ] : null,
          hw_events:plan[i].boi ? plan[i].hw_events ? plan[i].hw_events : null : null,
          layout: {
            autosize: true,
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
      utils = {
        department: data.dc,
        site: data.site,
      };
      context.commit("SET_LOAD_DATA", data);
      context.commit("SET_LINES", lines);
      context.commit("SET_UTILS", utils);
      context.commit("SET_LOADER", false);
    },
    GET_PRODUCTION_DATA: async (context, payload) => {
      let pdc = [];
      let vlc = [];
      let pkc = [];
      let load = context.getters.LOAD_DATA;
      for (let i = 0; i < load.length; i++) {
        let lines = Object.values(load[i].lines);
        let keys = Object.keys(load[i].lines);
        for (let j = 0; j < lines.length; j++) {
          if (keys[j] === payload) {
            let key = Object.keys(lines[j].product);
            let value = Object.values(lines[j].product);
            for (let k = 0; k < value.length; k++) {
              pdc.push({ key: key[k], value: value[k][0].pdc });
              vlc.push({ key: value[k][0].vol_val, value: value[k][0].vlc });
              pkc.push({ key: value[k][0].pkc_val, value: value[k][0].pkc });
            }
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
        for (let j = 0; j < lines[i].length; j++) {
          if (lines[i][j].key === payload.key) {
            lines[i][j].status = StatusDecoder(payload.status);
          }
        }
      }
      context.commit("UPDATE_LINES", lines);
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
  plugins: [dataState],
});
