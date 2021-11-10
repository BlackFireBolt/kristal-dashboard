import vuex from "vuex";
import Vue from "vue";
import axios from "axios";
import { TokenValidation } from "../plugins/utils.js";
import { StatusDecoder } from "../plugins/utils.js";
import { AccidentStatus } from "../plugins/utils.js";
import { EventsDecoder } from "../plugins/utils.js";
import createPersistedState from "vuex-persistedstate";
import FormData from "form-data";

Vue.use(vuex);

const dataState = createPersistedState({
  reducer: (state) => {
    return {
      tokenJWT: state.tokenJWT,
      user: state.user,
    };
  },
});

const getDefaultState = () => {
  return {
    sse: null,
    status: null,
    statusColor: null,
    loader: true,
    load_data: null,
    drawer: false,
    lines: null,
    utils: [],
    user: {},
    tokenJWT: "",
  };
};

const getDeafultStateWithUser = () => {
  return {
    sse: null,
    status: null,
    statusColor: null,
    load_data: null,
    lines: null,
    utils: [],
  };
};

export const store = new vuex.Store({
  state: {
    sse: null,
    status: null,
    statusColor: null,
    loader: false,
    load_data: null,
    drawer: false,
    lines: null,
    utils: null,
    user: {},
    tokenJWT: "",
  },
  mutations: {
    RESET_SSE: (state) => {
      state.sse = null;
    },
    SET_SSE: (state, payload) => {
      state.sse = payload;
    },
    SET_STATUS_COLOR: (state, payload) => {
      state.statusColor = payload;
    },
    SET_STATUS: (state, payload) => {
      state.status = payload;
    },
    SET_UTILS: (state, payload) => {
      state.utils = payload;
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
    RESET_STATE: (state) => {
      Object.assign(state, getDefaultState());
    },
    RESET_STATE_WITH_USER: (state) => {
      Object.assign(state, getDeafultStateWithUser());
    },
  },
  getters: {
    LOAD_SSE: (state) => {
      return state.sse;
    },
    LOAD_STATUS_COLOR: (state) => {
      return state.statusColor;
    },
    LOAD_STATUS: (state) => {
      return state.status;
    },
    LOAD_UTILS: (state) => {
      return state.utils;
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
    SWITCH_CHANNEL: (context, payload) => {
      Vue.cookie.set("channel", JSON.stringify(payload), 7);
      context.commit("SET_LOADER", true);

      context.dispatch("GET_LOAD_DATA", payload).then(() => {
        context.dispatch("GET_LOAD_STREAM", payload).then(() => {
          context.commit("SET_LOADER", false);
        });
      });
    },
    CLOSE_SSE: (context) => {
      let sse = context.getters.LOAD_SSE;
      if (sse !== null) {
        sse.close();
      }
      context.commit("RESET_SSE");
      console.log("closed all");
    },
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
          plot_id: key[i].charAt(1),
          dep_id: key[i].charAt(4),
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
              line: { color: '#17BECF', shape: 'hv'},
              mode: "lines",
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
              line: { color: '#7F7F7F', shape: 'hv'},
              mode: "lines",
              name: "Разливной счетчик",
            },
          ],

          /*chartOptions: {
            type: "line",
            defaultPoint_tooltip: "%seriesName<br/>%yValue",
            legend: {
              template: "%icon %name",
            },
            xAxis: {
              scale: {
                type: "time",
                interval: {
                  unit: "minute",
                  multiplier: 2,
                },
              },
            },
            yAxis: { scale: { range: [0, 10000] } },
            series: [
              {
                name: "Акцизный счетчик",
                points: plan[i].plot_last
                  ? plan[i].plot_last.boi["1"]
                    ? plan[i].plot_last.boi["1"]
                    : []
                  : [],
              },
              {
                name: "Разливной счетчик",
                points: plan[i].plot_last
                  ? plan[i].plot_last.boi["2"]
                    ? plan[i].plot_last.boi["2"]
                    : []
                  : [],
              },
            ],
          },*/

          info: plan[i].boi
            ? [
                {
                  bid: plan[i].boi["1"] ? plan[i].boi["1"].bid : null,
                  info: plan[i].boi["1"]
                    ? plan[i].boi["1"].info
                      ? plan[i].boi["1"].info
                      : null
                    : null,
                },
                {
                  bid: plan[i].boi["2"] ? plan[i].boi["2"].bid : null,
                  info: plan[i].boi["2"]
                    ? plan[i].boi["2"].info
                      ? plan[i].boi["2"].info
                      : null
                    : null,
                },
              ]
            : null,
          hw_events_1: plan[i].boi
            ? plan[i].boi["1"].hw_events
              ? EventsDecoder(plan[i].boi["1"].hw_events)
              : []
            : [],
          hw_events_2: plan[i].boi
            ? plan[i].boi["2"].hw_events
              ? EventsDecoder(plan[i].boi["2"].hw_events)
              : []
            : [],
          layout: {
            height: 340,
            scale: 1,
            margin:{
              b: 40,
              t: 20
            },
            autosize: true,
            showlegend: true,
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
          layoutLow: {
            height: 265,
            scale: 1,
            margin:{
              b: 40,
              t: 20
            },
            autosize: true,
            showlegend: true,
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
          statusPvFirst: plan[i].boi
            ? plan[i].boi["1"]["status-pv"]
              ? plan[i].boi["1"]["status-pv"]
              : 0
            : 0,
          statusSpFirst: plan[i].boi
            ? plan[i].boi["1"]["status-sp"]
              ? plan[i].boi["1"]["status-sp"]
              : 0
            : 0,
          statusPvSecond: plan[i].boi
            ? plan[i].boi["2"]["status-pv"]
              ? plan[i].boi["2"]["status-pv"]
              : 0
            : 0,
          statusSpSecond: plan[i].boi
            ? plan[i].boi["2"]["status-sp"]
              ? plan[i].boi["2"]["status-sp"]
              : 0
            : 0,
        };
        if (plan[i].plan) {
          line_object.timetable = plan[i].plan.timetable;
        } else {
          line_object.product = plan[i].product;
        }
        let pdc = [];
        let vlc = [];
        let pkc = [];
        let txc = [];
        let key_txc = Object.keys(plan[i].txc);
        let value_txc = Object.values(plan[i].txc);
        for (let k = 0; k < value_txc.length; k++) {
          txc.push({ key: key_txc[k], value: value_txc[k] });
        }
        line_object.txc_variants = txc;
        let key_product = Object.keys(plan[i].product);
        let value_product = Object.values(plan[i].product);
        for (let k = 0; k < value_product.length; k++) {
          pdc.push({ key: key_product[k], value: value_product[k][0].pdc });
          vlc.push({
            key: value_product[k][0].vol_val,
            value: value_product[k][0].vlc,
          });
          pkc.push({
            key: value_product[k][0].pkc_val,
            value: value_product[k][0].pkc,
          });
        }
        line_object.pdc_variants = pdc;
        line_object.vlc_variants = vlc;
        line_object.pkc_variants = pkc;
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
    GET_LOAD_STREAM: async (context, payload) => {
      let server_side = new EventSource(
        "http://attp.kristal.local:5000/stream?chan=" + payload // check bad data?s
      );
      server_side.addEventListener("control", () => {}, false);
      server_side.addEventListener(
        "message",
        (event) => {
          var load_data = JSON.parse(event.data.replace(/^\s+|\s+$/g, ""));
          let key = Object.keys(load_data)[0];
          let data = Object.values(load_data)[0];
          if (data.bitstatus) {
            let payload = context.getters.LOAD_LINES;
            for (let i = 0; i < payload.length; i++) {
              if (payload[i].key === key) {
                context.dispatch("GET_STATUS", {
                  key: key,
                  status: data.bitstatus,
                });
                Vue.notify({
                  title: "Уведомление",
                  type: "info",
                  text: "Изменение статуса линии №" + payload[i].key + "!",
                });
                break;
              }
            }
          }
          if (data.boi) {
            let boi = data.boi;
            let payload = context.getters.LOAD_LINES;
            for (let i = 0; i < payload.length; i++) {
              if (payload[i].key === key) {
                if (boi["1"]) {
                  if (boi["1"]["spd"] && boi["1"]["stats-ts"]) {
                    payload[i].series[0].x.push(boi["1"]["stats-ts"]);
                    payload[i].series[0].y.push(boi["1"]["spd"]);
                  }
                  if (boi["1"]["status-pv"]) {
                    payload[i].statusPvFirst = boi["1"]["status-pv"];
                  }
                  if (boi["1"]["status-sp"]) {
                    payload[i].statusSpFirst = boi["1"]["status-sp"];
                  }
                  if (boi["1"]["info"]) {
                    payload[i].info[0].pdc = boi["1"]["info"].pdc;
                    payload[i].info[0].pkc = boi["1"]["info"].pkc;
                    payload[i].info[0].vlc = boi["1"]["info"].vlc;
                    payload[i].info[0].txc = boi["1"]["info"].txc;
                  }
                }
                if (boi["2"]) {
                  if (boi["2"]["spd"] && boi["2"]["stats-ts"]) {
                    payload[i].series[1].x.push(boi["2"]["stats-ts"]);
                    payload[i].series[1].y.push(boi["2"]["spd"]);
                  }
                  if (boi["2"]["info"]) {
                    payload[i].info[1].pdc = boi["2"]["info"].pdc;
                    payload[i].info[1].pkc = boi["2"]["info"].pkc;
                    payload[i].info[1].vlc = boi["2"]["info"].vlc;
                    payload[i].info[1].txc = boi["2"]["info"].txc;
                  }
                  if (boi["2"]["status-pv"]) {
                    payload[i].statusPvSecond = boi["2"]["status-pv"];
                  }
                  if (boi["2"]["status-sp"]) {
                    payload[i].statusSpSecond = boi["2"]["status-sp"];
                  }
                }
                if (
                  Date.now() - payload[i].series[0].x[0] >= 1200000 &&
                  payload[i].series[0].x.length > 10
                ) {
                  payload[i].series[0].x.shift();
                  payload[i].series[0].y.shift();
                }

                if (
                  Date.now() - payload[i].series[1].x[0] >= 1200000 &&
                  payload[i].series[1].x.length > 10
                ) {
                  payload[i].series[1].x.shift();
                  payload[i].series[1].y.shift();
                }
                context.commit("UPDATE_LINES", payload);
                break;
              }
            }
          }
          if (data.timetable && data.lredkey) {
            let payload = context.getters.LOAD_LINES;
            for (let i = 0; i < payload.length; i++) {
              for (let j = 0; j < payload[i].length; j++) {
                if (payload[i][j].key === data.lredkey) {
                  payload[i][j].timetable = data.timetable;
                  console.log("check");
                  context.commit("UPDATE_LINES", payload);
                  break;
                }
              }
            }
          }
        },
        false
      );
      server_side.addEventListener(
        "broadcast",
        (event) => {
          let data = JSON.parse(event.data);
          if (data.msg) {
            console.log("GOT BROADCAST!", data);
          }
        },
        false
      );
      server_side.onopen = () => {
        console.log("eventstream opened");
        Vue.notify({
          title: "Уведомление",
          type: "success",
          text: `Соединение установлено (${payload})!`,
        });
        context.commit("SET_STATUS", "Сервер на связи");
        context.commit("SET_STATUS_COLOR", "green--text");
      };
      server_side.onclose = () => {
        server_side.close();
        Vue.notify({
          title: "Уведомление",
          type: "error",
          text: `Соединение с сервером закрыто (${payload})!`,
        });
        context.commit("SET_STATUS", "Соединение с сервером закрыто");
        context.commit("SET_STATUS_COLOR", "red--text");
        console.log("CONNECTION CLOSED");
      };
      server_side.onerror = () => {
        console.log("error");
        Vue.notify({
          title: "Уведомление",
          type: "error",
          text: "Ошибка соединения!",
        });
        context.commit(
          "SET_STATUS",
          `Связь с сервером отсутствует (${payload})`
        );
        context.commit("SET_STATUS_COLOR", "red--text");
      };
      context.commit("SET_SSE", server_side);
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
      let form = new FormData();
      form.append("username", payload.username);
      form.append("password", payload.password);
      await axios
        .post(
          "http://auth.vmvisioprom.kristal.local/api/security/login",
          form,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((response) => {
          payload.name = response.data.name;
          payload.role_name = response.data.role_name;
          payload.channels = response.data.role_channels;
          payload.rights = response.data.role_rights;
          payload.superuser = response.data.superuser;
          context.commit("SET_USER", payload);
          context.commit("SET_TOKEN", { token: response.data.access_token });
          axios.post(
            "http://auth.vmvisioprom.kristal.local/api/log/",
            { user: payload.name, description: "SUCCESS LOGIN" },
            { header: { "Content-type": "application/json" } }
          );
        })
        .catch((error) => {
          Vue.notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка авторизации!",
          });
          axios.post(
            "http://auth.vmvisioprom.kristal.local/api/log/",
            { user: "Unknown", description: "LOGIN ERROR" },
            { header: { "Content-type": "application/json" } }
          );
          console.log("Auth error: ", error);
        });
    },
    LOGOUT: async (context) => {
      await axios.post(
        "http://auth.vmvisioprom.kristal.local/api/log/",
        { user: context.getters.LOAD_USER.name, description: "LOGOUT" },
        { header: { "Content-type": "application/json" }, timeout: 1000 * 5 }
      );
      context.dispatch("CLOSE_SSE");
      context.commit("RESET_STATE");
    },
  },
  plugins: [dataState],
});
