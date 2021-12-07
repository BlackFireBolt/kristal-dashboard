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
import VuePlotly from "@statnett/vue-plotly";

export default {
  name: "ArchiveDetail",
  components: {VuePlotly}
};
</script>
