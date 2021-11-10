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
      this.$store.dispatch("CLOSE_SSE");
      this.$store.commit("RESET_STATE_WITH_USER");
      let channel = JSON.parse(this.$cookie.get("channel"));
      this.$store
        .dispatch("GET_LOAD_DATA", channel)
        .then(() => this.$store.dispatch("GET_LOAD_STREAM", channel));
    },
    currentDate() {
      let current = new Date();
      let date = `${current.getDate()}/${
        current.getMonth() + 1
      }/${current.getFullYear()}`;
      return date;
    },
  },
  computed:{
    status() {
      return this.$store.getters.LOAD_STATUS;
    },
    statusColor() {
      return this.$store.getters.LOAD_STATUS_COLOR;
    },
  },
  mounted: function () {
    setInterval(() => {
      this.time = moment().format("LTS");
    }, 1000);
  },
};
</script>
