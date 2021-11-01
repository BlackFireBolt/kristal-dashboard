<template>
  <div>
    <v-tabs v-model="tab">
      <v-tab> Лог событий </v-tab>
      <v-tab> Управление пользователями </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card>
          <v-card-text>
              <v-btn
              @click="loadLog"
              icon
              elevation="2"
              class="mb-2"
              outlined
              color="green"
              ><v-icon>mdi-update</v-icon></v-btn
            >
            <v-data-table
              :headers="log_headers"
              :items="log"
              :items-per-page="20"
              class="elevation-1"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminPage",
  data() {
    return {
        logTimeout: null,
        tab: null,
      log_headers: [
        {
          text: "ID",
          align: "start",
          value: "id",
        },
        {
          text: "Описание",
          value: "description",
        },
        {
          text: "Пользователь",
          value: "user",
        },
        {
          text: "Дата и время",
          value: "event_date",
        },
      ],
      log: [],
    };
  },
  methods: {
    async loadLog() {
      await axios
        .get("http://auth.vmvisioprom.kristal.local/api/log/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.log = response.data;
        });
    },
  },
  mounted() {
    this.loadLog();
    this.logTimeout = setInterval(() => {
      this.loadLog();
    }, 60000);
  },
  beforeDestroy() {
    console.log("destroy");
    clearInterval(this.logTimeout);
  },
};
</script>
