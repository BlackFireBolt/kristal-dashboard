<template>
  <v-row>
    <v-col cols="1">
      <v-btn @click="reload" icon><v-icon>mdi-reload</v-icon></v-btn>
    </v-col>
    <v-col :class="statusColor" cols="7">
      {{ status }}
    </v-col>
    <v-col md="4" align="right">{{ currentDate() }} {{ time }}</v-col>
  </v-row>
</template>

<script>
import moment from "moment";
export default {
  name: "Footer",
  data() {
    return {
      time: moment().format("LTS"),
    };
  },
  methods: {
    reload() {
      if ((this.$store.getters.LOAD_USER.rights & 1) == 1) {
        var channels = [];
        if (this.$store.getters.LOAD_USER.superuser) {
          channels = ["c1_s1", "c2_s2", "c2_s3"];
        } else {
          channels = this.$store.getters.LOAD_USER.channels;
        }
        this.$store.dispatch("CLOSE_SSE");
        this.$store.commit("RESET_STATE_WITH_USER");
        for (let i = 0; i < channels.length; i++) {
          this.$store
            .dispatch("GET_LOAD_DATA", channels[i])
            .then(() => this.$store.dispatch("GET_LOAD_STREAM", channels[i]));
        }
      }
    },
    currentDate() {
      let current = new Date();
      let date = `${current.getDate()}/${
        current.getMonth() + 1
      }/${current.getFullYear()}`;
      return date;
    },
  },
  props: {
    status: {
      type: String,
      default: "Состояние соединения с сервером неизвестно",
    },
    statusColor: {
      type: String,
    },
  },
  mounted: function () {
    setInterval(() => {
      this.time = moment().format("LTS");
    }, 1000);
  },
};
</script>
