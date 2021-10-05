<template>
  <div>
    <v-expansion-panels accordion focusable tile multiple v-model="panel">
      <v-expansion-panel v-for="(department, index) in linesList" :key="index">
        <v-expansion-panel-header>
          {{ loadUtils[index].department }} --- {{ loadUtils[index].site }}
          <template v-slot:actions>
            <v-icon color="primary"> $expand </v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row no-gutters>
            <v-col
              cols="12"
              md="6"
              sm="12"
              xs="12"
              v-for="item in department"
              :key="item.id"
            >
              <v-card tile outlined>
                <v-card-text>
                  <v-app-bar flat dense color="white">
                    <v-card-title>Линия №{{ item.line_id }}</v-card-title>
                    <v-spacer></v-spacer>
                    <v-btn
                    color="primary"
                    @click="
                      $router.push({
                        name: 'Control',
                        params: {
                          key: item.key,
                        },
                      })
                    "
                  >
                    Управление
                  </v-btn>
                    <div v-if="item.timetable" class="mx-2">
                      <v-badge
                        overlap
                        :value="item.timetable.length"
                        :content="item.timetable.length"
                        color="green"
                      >
                        <v-btn
                          fab
                          dark
                          small
                          @click="item.dialogTasks = true"
                          color="blue"
                        >
                          <v-icon dark> mdi-clock-outline </v-icon>
                        </v-btn></v-badge
                      >
                    </div>
                    <v-btn disabled class="mx-2" fab small color="blue" v-else>
                      <v-icon dark> mdi-clock-outline </v-icon>
                    </v-btn>
                    <v-badge
                      overlap
                      color="green"
                      icon="mdi-exclamation-thick"
                      :value="item.accidentStatus"
                      ><v-btn
                        fab
                        dark
                        small
                        color="warning"
                        @click="item.dialogAccidents = true"
                      >
                        <v-icon dark>
                          mdi-clipboard-check-multiple-outline
                        </v-icon>
                      </v-btn>
                    </v-badge>
                    <v-btn class="mx-2" fab dark small color="error">
                      <v-icon dark> mdi-cog-outline </v-icon>
                    </v-btn>
                  </v-app-bar>
                  <v-sheet width="100%" height="120">
                    <v-container
                      ><status
                        :status="item.status"
                        :statusPvFirst="item.statusPvFirst"
                        :statusSpFirst="item.statusSpFirst"
                        :statusPvSecond="item.statusPvSecond"
                        :statusSpSecond="item.statusSpSecond"
                        :accident="item.accidentStatus" /></v-container
                  ></v-sheet>
                  <v-sheet width="100%" height="100%">
                    <v-container>
                      <vue-plotly
                        :id="item.key"
                        :refers="item.key"
                        :data="item.series"
                        :layout="item.layoutLow"
                        :autoResize="true"
                    /></v-container>
                  </v-sheet>
                </v-card-text>
              </v-card>
              <div v-for="item in department" :key="item.id">
                <v-dialog
                  :retain-focus="false"
                  scrollable
                  v-model="item.dialogTasks"
                  width="1000"
                  transition="dialog-top-transition"
                >
                  <v-card>
                    <v-toolbar color="primary" flat dark>
                      <v-toolbar-title>Список заданий</v-toolbar-title>
                      <v-spacer></v-spacer
                      ><v-btn icon dark @click="item.dialogTasks = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn></v-toolbar
                    >

                    <tasks :tasks="item.timetable" />
                  </v-card>
                </v-dialog>
                <v-dialog
                  v-model="item.dialogAccidents"
                  fullscreen
                  persistent
                  hide-overlay
                  :retain-focus="false"
                  transition="dialog-bottom-transition"
                >
                  <v-card tile>
                    <v-toolbar dark flat color="primary">
                      <v-btn icon dark @click="item.dialogAccidents = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                      <v-toolbar-title
                        >Журнал событий линии №{{
                          item.line_id
                        }}</v-toolbar-title
                      >
                      <v-spacer></v-spacer>
                      <v-toolbar-items>
                        <v-btn dark text @click="item.dialogAccidents = false"
                          ><v-icon>mdi-upload</v-icon>
                          Отправить
                        </v-btn>
                      </v-toolbar-items>
                    </v-toolbar>
                    <v-card-text>
                      <accidents :line_key="item.key" />
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import Status from "../components/Status.vue";
import VuePlotly from "@statnett/vue-plotly";
import Accidents from "../components/Accidents.vue";
import Tasks from "../components/Tasks.vue";

export default {
  name: "Dashboard",
  components: { Status, VuePlotly, Accidents, Tasks },
  data() {
    return {
      panel: [1],
      options: {
        responsive: true,
      },
    };
  },
  watch: {
    gid: function (value) {
      this.changeExport(value);
    },
    panel: function (value) {
      this.$cookie.set("panel", JSON.stringify(value), 7);
    },
  },
  computed: {
    linesList() {
      return this.$store.getters.LOAD_LINES;
    },
    loadDataList() {
      return this.$store.getters.LOAD_DATA;
    },
    loadUtils() {
      return this.$store.getters.LOAD_UTILS;
    },
  },
  created() {
    this.panel = JSON.parse(this.$cookie.get("panel"));
  },
};
</script>
