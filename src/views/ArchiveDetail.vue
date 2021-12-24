<template>
  <v-card>
    <v-card-title
      >Линия №1 --- Участок №1 --- Цех №1<v-spacer></v-spacer
      >{{ this.$route.params.date }}</v-card-title
    >
    <v-card-text>
      <v-btn
        rounded
        depressed
        color="indigo"
        dark
        @click="$router.push('/archive')"
        ><v-icon dark> mdi-chevron-left </v-icon>Назад</v-btn
      >
      <v-divider class="my-5"></v-divider>
      <v-row>
        <v-col cols="12" md="10">
          <v-sheet color="white" height="400"
            ><vue-plotly
              :data="series"
              :options="options"
              :layout="layout"
              :display-mode-bar="false"
              :autoResize="true"
            />
          </v-sheet>
        </v-col>
        <v-col cols="12" md="2">
          <v-card flat>
            <v-card-title>Статистика</v-card-title>
            <v-card-text>
              <div v-for="item in statistics" v-bind:key="item.key">
                {{ item.key }}:
                {{ item.value }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4" v-for="(job, id) in jobs" v-bind:key="id">
          <v-card>
            <v-card-title>Задание №{{ id + 1 }}</v-card-title>
            <v-card-subtitle
              >{{ formatDate(job.ts_start) }} -----
              {{ formatDate(job.ts_stop) }}</v-card-subtitle
            >
            <v-card-text>
              <v-simple-table dense>
                <template v-slot:default>
                  <thead></thead>
                  <tbody>
                    <tr>
                      <td>Продукция</td>
                      <td>{{ job.data.product }}</td>
                    </tr>
                    <tr>
                      <td>Сквозной</td>
                      <td>{{ job.data.total_counter }}</td>
                    </tr>
                    <tr>
                      <td>Уставка</td>
                      <td>{{ job.data.sp }}</td>
                    </tr>
                    <tr>
                      <td>Насчитано в розливе</td>
                      <td>{{ job.data.pv }}</td>
                    </tr>
                    <tr>
                      <td>Насчитано без марок</td>
                      <td>{{ job.data.pv_0 }}</td>
                    </tr>
                    <tr>
                      <td>Насчитано без задания</td>
                      <td>{{ job.data.pv_1 }}</td>
                    </tr>
                    <tr>
                      <td>Тара</td>
                      <td>{{ job.data.pack }}</td>
                    </tr>
                    <tr>
                      <td>Объем</td>
                      <td>{{ job.data.vol }}</td>
                    </tr>
                    <tr>
                      <td>Тип марки</td>
                      <td>{{ job.data.txc }}</td>
                    </tr>
                    <tr>
                      <td>Марка</td>
                      <td>{{ job.data.tax }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import VuePlotly from "@statnett/vue-plotly";

export default {
  name: "ArchiveDetail",
  components: { VuePlotly },
  data() {
    return {
      jobs: [],
      statistics: [],
      series: [
        {
          x: [],
          y: [],
          type: "scatter",
          line: { color: "#17BECF", shape: "vh" },
          mode: "lines",
          name: "Разливка",
        },
      ],
      options: {
        doubleClick: "reset",
        responsive: true,
        displaylogo: false,
        displayModeBar: true,
        modeBarButtonsToRemove: [
          "toggleSpikelines",
          "toImage",
          "pan2d",
          "select2d",
          "lasso2d",
          "resetScale2d",
          "autoScale2d",
        ],
      },
      layout: {
        height: 340,
        scale: 1,
        margin: {
          b: 40,
          t: 20,
        },
        autosize: true,
        showlegend: true,
        yaxis: { range: [0, 10000] },
        xaxis: { tickformat: "%H:%M:%S", type: "date" },
      },
    };
  },
  methods: {
    formatDate(timestamp) {
      var date = new Date(timestamp * 100);

      return (
        ("0" + date.getHours()).slice(-2) +
        ":" +
        ("0" + date.getMinutes()).slice(-2) +
        ":" +
        ("0" + date.getSeconds()).slice(-2)
      );
    },
    async downloadData() {
      const [year, month, day] = this.$route.params.date.split("-");
      await axios
        .get(
          "http://attp.kristal.local:5000/datalog?period=" +
            `${day}-${month}-${year}` +
            "&redkey=" +
            this.$route.params.key,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        )
        .then((response) => {
          let data = Object.values(response.data);
          this.series[0].y = data[0].plot_spd5m.data;
          this.series[0].x = data[0].plot_spd5m.ts.map((x) => x * 1000);
          this.jobs = data[0].jobs;
          let day_start = this.formatDate(this.series[0].x[0]/100);
          let day_stop = this.formatDate(this.series[0].x[this.series[0].x.length - 1]/100);
          let sum_pv = 0;
          data[0].jobs.forEach((job) => {sum_pv += job.data.pv})
          let sum_pv_0 = 0;
          data[0].jobs.forEach((job) => {sum_pv += job.data.pv_0})
          let sum_pv_1 = 0;
          data[0].jobs.forEach((job) => {sum_pv += job.data.pv_1})
          this.statistics = [
            { key: "Начало дневной розливки", value: day_start },
            { key: "Конец дневной розливки", value: day_stop },
            { key: "Насчитано за день", value: sum_pv},
            { key: "Насчитано без марок за день", value: sum_pv_0},
            { key: "Насчитано без задания за день", value: sum_pv_1}
          ];
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка соединения!",
          });
        });
    },
  },
  mounted() {
    this.downloadData();
  },
};
</script>
