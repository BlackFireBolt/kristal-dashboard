<template>
  <div>
    <v-overlay :value="loadingStatus">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <v-container fluid v-if="loadChannels && loadChannels.length > 1" class="mx-auto mb-5">
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
            sm="6"
            xs="12"
            v-for="channel in loadChannels"
            :key="channel.id"
          >
            <v-card hover cursor:pointer @click="switchChannel(channel)"
              ><v-card-text>
                <p class="text-h6 text--primary">
                  Цех №{{ channel.charAt(1) }} --- Участок №{{
                    channel.charAt(4)
                  }}
                </p>
                <!--<v-row>
                  <v-col cols="12" lg="3" md="6" sm="12" xs="12">
                    <v-card outlined class="mx-auto">
                      <v-card-subtitle>Линия 1</v-card-subtitle>
                      <v-card-text>
                        <v-chip class="mb-2 mr-3" color="success" pill x-small>
                          <v-icon left>mdi-check-decagram</v-icon
                          >Работает </v-chip
                        ><v-chip class="mb-2 mr-3" color="success" pill x-small>
                          <v-icon left>mdi-check-decagram</v-icon
                          >Включена</v-chip
                        >
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" lg="3" md="6" sm="12" xs="12">
                    <v-card outlined class="mx-auto">
                      <v-card-subtitle>Линия 2</v-card-subtitle>
                      <v-card-text>
                        <v-chip class="mb-2 mr-3" color="success" pill x-small>
                          <v-icon left>mdi-check-decagram</v-icon
                          >Работает </v-chip
                        ><v-chip class="mb-2 mr-3" color="success" pill x-small>
                          <v-icon left>mdi-check-decagram</v-icon
                          >Включена</v-chip
                        >
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>-->
              </v-card-text></v-card
            >
          </v-col>
        </v-row>
      </v-card-text>
    </v-container>
    <v-container fluid v-if="linesList">
      <p class="title" v-if="loadUtils">
        {{ loadUtils.department }} --- {{ loadUtils.site }}
      </p>
      <v-row no-gutters>
        <v-col
          cols="12"
          md="6"
          sm="12"
          xs="12"
          v-for="item in linesList"
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
                    <v-icon dark> mdi-clipboard-check-multiple-outline </v-icon>
                  </v-btn>
                </v-badge>
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
              <v-sheet color="white" height="250">
                <vue-plotly
                  :id="item.key"
                  :refers="item.key"
                  :data="item.series"
                  :layout="item.layoutLow"
                  :options="options"
                  :autoResize="true"
                />
              </v-sheet>
            </v-card-text>
          </v-card>
          <div v-for="item in linesList" :key="item.id">
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
                    >Журнал событий линии №{{ item.line_id }}</v-toolbar-title
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
    </v-container>
    <v-container fluid v-else>
      <div class="message">
        <p>
          {{ message }}
        </p>
      </div>
    </v-container>
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
      message: "Выберите участок для просмотра",
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
    };
  },
  methods: {
    switchChannel(channel) {
      this.$store.dispatch("CLOSE_SSE");
      this.$store.commit("RESET_STATE_WITH_USER");
      this.$store.dispatch("SWITCH_CHANNEL", channel);
    },
  },
  computed: {
    loadingStatus() {
      return this.$store.getters.LOAD_LOADER;
    },
    loadChannels() {
      if ((this.loadUser.rights & 1) === 1) {
        var channels = [];
        if (this.loadUser.superuser) {
          channels = ["c1_s1", "c2_s2", "c2_s3"];
        } else {
          channels = this.loadUser.channels;
        }
      }
      return channels;
    },
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
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
};
</script>

<style scoped>
.message {
  text-align: center;
  position: relative;
}
.message p {
  font-size: 36px;
  color: teal;
  padding-top: 90px;
  position: relative;
  z-index: 9;
  line-height: 100%;
}
.chart {
  height: 240px;
}
</style>
