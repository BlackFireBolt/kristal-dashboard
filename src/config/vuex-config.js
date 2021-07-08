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
    user: {},
    tokenJWT: "",
  },
  mutations: {
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
      console.log(payload)
      for(let i = 0; i <state.lines.length; i++){
        if(state.lines[i].key === payload.key){
          state.lines[i].accidents = payload.accidents.sort((a, b) => b - a);
          state.lines[i].accidentStatus = payload.status
        }
      }
    }
  },
  getters: {
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
    GET_LOAD_DATA: async (context) => {
      let { data } = await axios.get("http://attp.kristal.local:5000/vue?c=" + context.getters.LOAD_USER.channels.slice(-1), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      var load = data.lines;
      var lines = [];
      for (var i = 0; i < load.length; i++) {
        var plan = Object.values(load[i])[0];
        let key = Object.keys(load[i])[0];
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
          ]
        let line_object = {
          line_id: key.slice(-1),
          key: key,
          status: StatusDecoder(plan.bitstatus),
          series: [
            {
              x: plan.boi["1"]["stats-ts"] ? [plan.boi["1"]["stats-ts"]] : [Date.now()],
              y: [0],
              type: "scatter",
              line: { shape: "hv" },
              name: "Первый счетчик",
            },
            {
              x: plan.boi["2"]["stats-ts"] ? [plan.boi["2"]["stats-ts"]] : [Date.now()],
              y: [0],
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
                y0: plan.plan? plan.plan.avgspd:6000,
                x1: 1,
                y1: plan.plan? plan.plan.avgspd:6000,
                line: {
                  color: "rgb(255, 0, 0)",
                  width: 4,
                  dash: "dot",
                },
              },
            ],
          },
          accidents: accidents,
          accidentStatus: AccidentStatus(accidents),
          statusPv: plan.boi["1"]["status-pv"],
          statusSp: plan.boi["1"]["status-sp"],
        };
        if (plan.plan) {
          line_object.timetable = plan.plan.timetable;
        } else {
          line_object.product = plan.product;
        }

        lines.push(line_object);
      }
      context.commit("SET_LOAD_DATA", data);
      context.commit("SET_LINES", lines);
      context.commit("SET_LOADER", false);
    },
    GET_LOAD_DATA_SINGLE_LINE: async (context, payload) => {
      let { data } = await axios.get("http://172.17.0.162:5000/vue?c=" + context.getters.LOAD_USER.channels);
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
        .post("http://172.17.0.201:5050/login", payload, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        })
        .then((response) => {
          console.log(response);
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
    GET_CHART_DATA: async (context) => {
      let { data } = await axios.get("http://attp.kristal.local:5000/chart?c=c1_s1&a=15")
      let lines = context.getters.LOAD_LINES;
      let keys = Object.keys(data.lines)
      let plots = Object.values(data.lines);
      for (let i = 0; i < keys.length; i++){
        for(let j = 0;j < lines.length; j++) {
          if(lines[j].key === keys[i]){
            if(plots[i].plot["1"]){
            lines[j].series[0].x = []
            lines[j].series[0].y = []
            for(let k = 0;k< plots[i].plot["1"].length; k++){
              lines[j].series[0].x.push(plots[i].plot["1"][k][0])
              lines[j].series[0].y.push(plots[i].plot["1"][k][1])
            }}
            if(plots[i].plot["2"]){
            lines[j].series[1].x = []
            lines[j].series[1].y = []
            for(let k = 0;k< plots[i].plot["2"].length; k++){
              lines[j].series[1].x.push(plots[i].plot["2"][k][0])
              lines[j].series[1].y.push(plots[i].plot["2"][k][1])
            }}
          }
        }
      }
      console.log("worked chart")
      context.commit("SET_LINES", lines);
    }
  },
  plugins: [createPersistedState()],
});
