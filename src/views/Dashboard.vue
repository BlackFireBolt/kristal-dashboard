<template>
  <v-row>
    <v-col
      cols="12"
      md="6"
      sm="12"
      xs="12"
      v-for="item in linesList"
      :key="item.id"
    >
      <v-card class="mb-4">
        <v-card-text>
          <v-card-title>Линия №{{ item.line_id }}</v-card-title>
          <v-sheet width="100%" height="150">
            <v-container
              ><status
                :status="item.status"
                :statusPv="item.statusPv"
                :statusSp="item.statusSp"
                :accident="item.accidentStatus" /></v-container
          ></v-sheet>
          <v-sheet width="100%" height="100%">
            <v-container>
              <vue-plotly
                :id="item.key"
                :refers="item.key"
                :data="item.series"
                :layout="item.layout"
                :display-mode-bar="false"
                :autoResize="true"
            /></v-container>
          </v-sheet>

          <accidents :line_key="item.key" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Status from "../components/Status.vue";
import VuePlotly from "@statnett/vue-plotly";
import Accidents from "../components/Accidents.vue";

export default {
  name: "Dashboard",
  components: { Status, VuePlotly, Accidents },

  computed: {
    linesList() {
      let lines = this.$store.getters.LOAD_LINES.filter((i) => i.status & 1);
      for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < lines[i].accidents.length; j++) {
          if (lines[i].accidents[j].message === "") {
            lines[i].accidentStatus = true;
          }
        }
      }
      return lines;
    },
    loadDataList() {
      return this.$store.getters.LOAD_DATA;
    },
  },
};
</script>
