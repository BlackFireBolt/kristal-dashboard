<template>
  <div>
    <v-container>
      <v-select
        solo
        v-model="channel"
        :items="channels"
        item-text="text"
        item-value="value"
      ></v-select>
    </v-container>
    <v-container fluid v-if="dataLog">
      <v-row no-gutters>
        <v-col
          cols="12"
          md="6"
          sm="12"
          xs="12"
          v-for="item in dataLog"
          :key="item.id"
        >
          <v-card tile outlined>
            <v-card-title class="justify-center"
              >Линия № {{ item.key.slice(-1) }}</v-card-title
            >
            <v-card-text>
              <v-sheet height="350px">
                <vue-cal
                  active-view="month"
                  hide-view-selector
                  :time="false"
                  locale="ru"               
                  :events="item.events"
                  events-on-month-view="short"
                  :on-event-click="onEventClick"
                  :disable-views="['years', 'year', 'week', 'day']"
                />
              </v-sheet>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog
      v-model="showDialogEvent"
      transition="dialog-top-transition"
      max-width="500"
    >
      <v-card>
        <v-card-title>
          <span>{{ selectedEvent.title }}</span>
          <v-spacer />
          <strong>{{
            selectedEvent.start && selectedEvent.start.format("DD/MM/YYYY")
          }}</strong>
        </v-card-title>
        <v-card-text>
          <p v-html="selectedEvent.content" />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer
          ><v-btn color="rgb(114, 189, 114)" dark
            @click="
              $router.push({
                name: 'ArchiveDetail',
                params: {
                  key: selectedEvent.key,
                },
              })
            "
            >Подробнее</v-btn
          ></v-card-actions
        >
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import "vue-cal/dist/i18n/ru.js";

export default {
  name: "Archive",
  components: { VueCal },
  data() {
    return {
      selectedEvent: {},
      showDialogEvent: false,
      dataLog: null,
      data: true,
      channel: null,
      channels: [
        { text: "Цех 1 --- Участок 1", value: "c1_s1" },
        {
          text: "Цех 2 --- Участок 3",
          value: "c2_s3",
        },
      ],
      events: [{ start: "2021-12-1", end: "2021-12-1", title: "96876" }],
    };
  },
  watch: {
    channel: function (value) {
      this.loadDatalog(value);
    },
  },
  methods: {
    async loadDatalog(value) {
      await axios
        .get(
          "http://attp.kristal.local:5000/datalog?&period=2021&format=json&redkey=" +
            value,
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          let key = Object.keys(response.data);
          let values = Object.values(response.data);
          let dataLog = [];
          for (let i = 0; i < values.length; i++) {
            let key_data = Object.keys(values[i]);
            let values_data = Object.values(values[i]);
            let events = [];
            for (let j = 0; j < values_data.length; j++) {
              let content = "";
              let title = "";
              let maintainance = "";
              let pouring = "";
              if (typeof values_data[j]["1"] !== "undefined") {
                maintainance =
                  "Наладка:<br><ul><li> сумма по всем разливкам --- " +
                  values_data[j]["1"][0] +
                  "</li><li> количество разливок --- " +
                  values_data[j]["1"][1] +
                  "</li><li> ошибки --- " +
                  values_data[j]["1"][2] +
                  "</li></ul>";
                content += maintainance;
                title += "Наладка";
              }
              if (
                typeof values_data[j]["1"] !== "undefined" &&
                typeof values_data[j]["2"] !== "undefined"
              ) {
                title += " + ";
              }
              if (typeof values_data[j]["2"] !== "undefined") {
                pouring =
                  "Разливка:<br><ul><li> сумма по всем разливкам --- " +
                  values_data[j]["2"][0] +
                  "</li><li> количество разливок --- " +
                  values_data[j]["2"][1] +
                  "</li><li> ошибки --- " +
                  values_data[j]["2"][2] +
                  "</li></ul>";
                content += pouring;
                title += "Разливка";
              }
              events.push({
                start: new Date(parseInt(key_data[j]) * 1000),
                end: new Date(parseInt(key_data[j]) * 1000),
                title: title,
                content: content,
                key: key[i],
              });
            }
            dataLog.push({ key: key[i], events: events });
          }
          this.dataLog = dataLog;
        });
    },
    onEventClick(event) {
      this.selectedEvent = event;
      this.showDialogEvent = true;
    },
  },
  mounted() {},
};
</script>

<style>
.vuecal__cell--has-events {
  background-color: rgb(114, 189, 114);
}
.vuecal__cell-events-count {
  display: none;
}
.vuecal__event {
  cursor: pointer;
}
</style>
