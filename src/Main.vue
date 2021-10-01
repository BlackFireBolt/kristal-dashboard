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
      counter: 0,
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
    linesList() {
      return this.$store.getters.LOAD_LINES;
    },
  },
  created() {
    this.$store.commit("SET_LOADER", true);
  },
  mounted() {
    let channels_temp = ["c1_s1", "c2_s2", "c2_s3"];
    for (let i = 0; i < channels_temp.length; i++) {
      this.$store.dispatch("GET_LOAD_DATA", channels_temp[i]).then(() => {
        let server_side = new EventSource(
          "http://attp.kristal.local:5000/stream?chan=" + channels_temp[i] // check bad data?s
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
              let payload = this.linesList;
              for (let i = 0; i < payload.length; i++) {
                for (let j = 0; j < payload[i].length; j++) {
                  if (payload[i][j].key === key) {
                    this.$store.dispatch("GET_STATUS", {
                      key: key,
                      status: data.bitstatus,
                    });
                    this.$notify({
                      title: "Уведомление",
                      type: "info",
                      text:
                        "Изменение статуса линии №" +
                        payload[i][j].line_id +
                        "!",
                    });
                    break;
                  }
                }
              }
            }
            if (data.boi) {
              let boi = data.boi;
              let payload = this.linesList;
              for (let i = 0; i < payload.length; i++) {
                for (let j = 0; j < payload[i].length; j++) {
                  if (payload[i][j].key === key) {
                    if (boi["1"]) {
                      if (boi["1"]["spd"] && boi["1"]["stats-ts"]) {
                        payload[i][j].series[0].x.push(boi["1"]["stats-ts"]);
                        payload[i][j].series[0].y.push(boi["1"]["spd"]);
                      }
                      if (boi["1"]["status-pv"]) {
                        payload[i][j].statusPv = boi["1"]["status-pv"];
                      }
                      if (boi["1"]["status-sp"]) {
                        payload[i][j].statusSp = boi["1"]["status-sp"];
                      }
                      if(boi["1"]["info"]) {
                        payload[i][j].info = boi["1"]["info"];
                      }
                    }
                    if (boi["2"]) {
                      if (boi["2"]["spd"] && boi["2"]["stats-ts"]) {
                        payload[i][j].series[1].x.push(boi["2"]["stats-ts"]);
                        payload[i][j].series[1].y.push(boi["2"]["spd"]);
                      }
                      if(boi["2"]["info"]) {
                        payload[i][j].info = boi["2"]["info"];
                      }
                    }
                    if (
                      Date.now() - payload[i][j].series[0].x[0] >= 1200000 &&
                      payload[i][j].series[0].x.length > 10
                    ) {
                      payload[i][j].series[0].x.shift();
                      payload[i][j].series[0].y.shift();
                    }
                    if (
                      Date.now() - payload[i][j].series[1].x[0] >= 1200000 &&
                      payload[i][j].series[1].x.length > 10
                    ) {
                      payload[i][j].series[1].x.shift();
                      payload[i][j].series[1].y.shift();
                    }
                    this.$store.commit("UPDATE_LINES", payload);
                    break;
                  }
                }
              }
            }
            if (data.timetable && data.lredkey) {
              let payload = this.linesList;
              for (let i = 0; i < payload.length; i++) {
                for (let j = 0; j < payload[i].length; j++) {
                  if (payload[i][j].key === data.lredkey) {
                    payload[i][j].timetable = data.timetable;
                    console.log("check");
                    this.$store.commit("UPDATE_LINES", payload);
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
          this.counter = 0;
          console.log("eventstream opened");
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: `Соединение установлено (${channels_temp[i]})!`,
          });
          this.status = "Сервер на связи";
          this.statusColor = "green--text";
        };
        server_side.onclose = () => {
          server_side.close();
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: `Соединение с сервером закрыто (${channels_temp[i]})!`,
          });
          this.status = "Соединение с сервером закрыто";
          this.statusColor = "red--text";
          console.log("CONNECTION CLOSED");
        };
        server_side.onerror = () => {
          // this.counter++;
          // if (this.counter === 3){
          //   this.$router.push("/error");
          // }
          console.log("error");
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка соединения!",
          });
          this.status = `Связь с сервером отсутствует (${channels_temp[i]})`;
          this.statusColor = "red--text";
        };
        this.$store.commit("SET_LOADER", false);
      });
      /* .catch(() => {
        this.$router.push("/error");
      });*/
    }
    this.$store.commit("SET_LOADER", false);
  },
};
</script>
