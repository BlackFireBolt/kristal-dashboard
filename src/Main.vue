<template>
  <div>
    <v-overlay :value="loadingStatus">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <navigation />
    <bar />
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer app>
      <footer-comp :status="status" :statusColor="statusColor" />
    </v-footer>
    <notifications position="bottom right" />
  </div>
</template>

<script>
import Navigation from "./components/Navigation.vue";
import Bar from "./components/Bar.vue";
import Footer from "./components/Footer.vue";

export default {
  components: { Navigation, Bar, "footer-comp": Footer },
  name: "Main",
  data() {
    return {
      status: null,
      statusColor: null,
    };
  },
  computed: {
    loadingStatus() {
      return this.$store.getters.LOAD_LOADER;
    },
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
  },
  created(){
    this.$store.commit("SET_LOADER", true)
    this.$store.dispatch("GET_LOAD_DATA");
    this.$store.dispatch("GET_CHART_DATA");
  },

  mounted() {
    
    
    let server_side = new EventSource(
      "http://attp.kristal.local:5000/stream?chan=" +
        this.$store.getters.LOAD_USER.channels // check bad data?s
    );
    server_side.addEventListener(
      "control",
      () => {
        /*this.$store.dispatch("GET_CONTROL", event.data);*/
      },
      false
    );
    server_side.addEventListener(
      "message",
      (event) => {
        /*this.$store.dispatch("GET_MESSAGES", event.data);*/
        var load_data = JSON.parse(event.data.replace(/^\s+|\s+$/g, ""));
        let key = Object.keys(load_data)[0];
        let data = Object.values(load_data)[0];
        if (data.bitstatus) {
          let payload = this.$store.getters.LOAD_LINES;
          for (let i = 0; i < payload.length; i++) {
            if (payload[i].key === key) {
              this.$store.dispatch("GET_STATUS", {
                key: key,
                status: data.bitstatus,
              });
              this.$notify({
                title: "Уведомление",
                type: "info",
                text: "Изменение статуса линии №" + +payload[i].line_id + "!",
              });
              break;
            }
          }
        }
        if (data.boi) {
          let payload = this.$store.getters.LOAD_LINES;
          for (let i = 0; i < payload.length; i++) {
            if (payload[i].key === key) {
              let boi = data.boi;
              if (boi["1"]) {
                if (boi["1"]["spd"] && boi["1"]["stats-ts"]) {
                  for (let j = 0; j < payload.length; j++) {
                    if (payload[j].key === key) {
                      payload[j].series[0].x.push(boi["1"]["stats-ts"]);
                      payload[j].series[0].y.push(boi["1"]["spd"]);
                      break;
                    }
                  }
                }
                if (boi["1"]["status-pv"]) {
                  for (let j = 0; j < payload.length; j++) {
                    if (payload[j].key === key) {
                      payload[j].statusPv = boi["1"]["status-pv"];
                      break;
                    }
                  }
                }
                if (boi["1"]["status-sp"]) {
                  for (let j = 0; j < payload.length; j++) {
                    if (payload[j].key === key) {
                      payload[j].statusSp = boi["1"]["status-sp"];
                      break;
                    }
                  }
                }
              }
              if (boi["2"]) {
                if (boi["2"]["spd"] && boi["2"]["stats-ts"]) {
                  for (let j = 0; j < payload.length; j++) {
                    if (payload[j].key === key) {
                      payload[j].series[1].x.push(boi["2"]["stats-ts"]);
                      payload[j].series[1].y.push(boi["2"]["spd"]);

                      break;
                    }
                  }
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
              this.$store.commit("SET_LINES", payload);
              break;
            }
          }
        }
        if(data.timetable && data.lredkey) {
          let payload = this.$store.getters.LOAD_LINES;
          for (let i = 0; i < payload.length; i++){
            if (payload[i].key === data.lredkey) {
              payload[i].timetable = data.timetable;
              console.log("check")
              this.$store.commit("SET_LINES", payload);
              break;
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
      this.$store.commit("SET_LOADER", false)
      console.log("eventstream opened");
      this.$notify({
        title: "Уведомление",
        type: "success",
        text: "Соединение установлено!",
      });
      this.status = "Сервер на связи";
      this.statusColor = "green--text";
    };
    server_side.onclose = () => {
      server_side.close();
      this.$notify({
        title: "Уведомление",
        type: "error",
        text: "Соединение с сервером закрыто!",
      });
      this.status = "Соединение с сервером закрыто";
      this.statusColor = "red--text";
      console.log("CONNECTION CLOSED");
    };
    server_side.onerror = () => {
      console.log("error");
      this.$store.commit("SET_LOADER", true)
      this.$notify({
        title: "Уведомление",
        type: "error",
        text: "Ошибка соединения!",
      });
      this.status = "Связь с сервером отсутствует";
      this.statusColor = "red--text";
    };
    this.$store.commit("SET_LOADER", false)
  },
};
</script>
