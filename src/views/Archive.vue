<template>
  <div>
    <v-overlay :value="loadingStatus">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-container class="mx-auto mb-5">
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="6"
            sm="6"
            xs="12"
            v-for="channel in channels"
            :key="channel.id"
          >
            <v-card hover cursor:pointer @click="loadDatalog(channel)"
              ><v-card-text>
                <p class="text-h6 text--primary">
                  Цех №{{ channel.charAt(1) }} --- Участок №{{
                    channel.charAt(4)
                  }}
                </p>
              </v-card-text></v-card
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-container>
    <v-container fluid v-if="dataLog">
      <v-dialog v-model="dialogFilter" width="700">
        <template v-slot:activator="{ on, attrs }">
          <v-btn class="mb-5 mr-5" color="green" v-bind="attrs" v-on="on" dark
            ><v-icon>mdi-filter</v-icon>Фильтры</v-btn
          >
        </template>

        <v-card>
          <v-card-title class="text-h5 white--text teal lighten-1">
            Выберите желаемый промежуток для отображения
          </v-card-title>

          <v-card-text>
            <v-radio-group v-model="filterType">
              <v-radio
                v-for="n in filterTypes"
                :key="n"
                :label="`${n}`"
                :value="n.id"
              ></v-radio>
            </v-radio-group>
            <v-container fluid v-if="filterType === 0">
              <v-menu
                ref="pickMonth"
                v-model="pickMonth"
                :close-on-content-click="false"
                :return-value.sync="filterMonth"
                transition="scale-transition"
                offset-y
                max-width="290px"
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="filterMonthText"
                    label="Выберите месяц"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="filterMonth"
                  type="month"
                  no-title
                  range
                  scrollable
                  locale="ru-ru"
                >
                  <v-spacer></v-spacer>
                  <v-btn text color="primary" @click="pickMonth = false">
                    Отмена
                  </v-btn>
                  <v-btn
                    text
                    color="primary"
                    @click="$refs.pickMonth.save(filterMonth)"
                  >
                    ОК
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-container>
            <v-container fluid v-if="filterType === 1">
              <v-select
                v-model="filterYear"
                :items="years"
                prepend-icon="mdi-calendar"
                label="Выберите год"
              ></v-select>
            </v-container>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="dialogFilter = false"> Отмена </v-btn>
            <v-btn color="primary" text @click="loadDatalog(channel)">
              Применить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <span class="subtitle-2 text--disabled">{{ filterMessage }}</span>
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
          ><v-btn
            color="rgb(114, 189, 114)"
            dark
            @click="
              $router.push({
                name: 'ArchiveDetail',
                params: {
                  key: selectedEvent.key,
                  date: selectedEvent.start.toISOString().substr(0, 10),
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
      YEAR: "YEAR",
      filterMonth: [new Date().toISOString().substr(0, 7)],
      filterYear: new Date().getFullYear(),
      filterTypes: [
        "Информация за месяц/промежуток с месяца по месяц",
        "Информация за год",
      ],
      filterType: 0,
      filterMessage: "Информация за текущий месяц",
      pickMonth: false,
      years: [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015],
      dialogFilter: false,
      loadingStatus: false,
      channels: ["c1_s1", "c2_s3"],
      selectedEvent: {},
      showDialogEvent: false,
      dataLog: null,
      data: true,
      channel: null,
    };
  },
  computed: {
    filterMonthText() {
      if (this.filterMonth.length > 1) {
        return this.filterMonth.join(" ~ ");
      } else {
        return this.filterMonth[0];
      }
    },
  },
  methods: {
    formatDate(dateLog) {
      if (!dateLog) return "";
      const [year, month] = dateLog.split("-");
      return `${month}-${year}`;
    },
    async loadDatalog(value) {
      this.loadingStatus = true;
      this.channel = value;
      let filterString = "";
      if (this.filterType === 0) {
        filterString = this.filterMonth.map(this.formatDate).join(",");
        this.filterMessage = "Информация за " + this.filterMonthText;
      } else if (this.filterType === 1) {
        filterString = this.filterYear.toString();
        this.filterMessage = "Информация за " + filterString + " год";
      }
      await axios
        .get(
          "http://attp.kristal.local:5000/datalog?&period=" +
            filterString +
            "&format=json&redkey=" +
            value,
          { headers: { "Content-Type": "application/json" } }
        )
        .then((response) => {
          this.$cookie.set("datalog_channel", JSON.stringify(value), 7);
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
      this.dialogFilter = false;
      this.loadingStatus = false;
    },
    onEventClick(event) {
      this.selectedEvent = event;
      this.showDialogEvent = true;
    },
  },
  mounted() {
    this.channel = JSON.parse(this.$cookie.get("datalog_channel"));
    if (this.channel) {
      this.loadDatalog(this.channel);
    }
  },
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
