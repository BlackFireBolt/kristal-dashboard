<template>
  <v-row>
    <v-col :class="statusColor" cols="8">
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
