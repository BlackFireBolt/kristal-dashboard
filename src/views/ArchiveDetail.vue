<template>
  <v-card>
    <v-card-title>Линия №1 --- Участок №1 --- Цех №1</v-card-title>
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

      <v-sheet color="white" height="540"
        ><vue-plotly
          :data="series"
          :options="options"
          :layout="layout"
          :display-mode-bar="false"
          :autoResize="true"
        />
      </v-sheet>
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
          console.log(response);
          let plots = Object.values(response.data);
console.log(plots[0].plot_spd5m.data)
          this.series[0].y = plots[0].plot_spd5m.data;
          this.series[0].x =plots[0].plot_spd5m.ts.map((x)=> x * 1000);
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
    console.log(this.$route.params.key);
    console.log(this.$route.params.date);
    this.downloadData();
  },
};
</script>
