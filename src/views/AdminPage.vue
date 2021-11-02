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
            <v-row>
              <v-col cols="12" sm="1">
                <v-btn
                  @click="loadLog"
                  icon
                  elevation="2"
                  class="mb-2"
                  outlined
                  color="green"
                  ><v-icon>mdi-update</v-icon></v-btn
                ></v-col
              ><v-col cols="12" sm="2"
                ><div class="limit">
                  <v-text-field
                    v-model="limit"
                    outlined
                    dense
                    label="Лимит записей"
                    type="number"
                  ></v-text-field></div></v-col
            ></v-row>
            <v-data-table
              :headers="log_headers"
              :items="log"
              :items-per-page="20"
              :footer-props="{
                'items-per-page-options': [20, 30, 40, 50],
              }"
              class="elevation-1"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card
          ><v-card-text
            ><v-data-table
              :headers="users_headers"
              :items="users"
              :items-per-page="20"
              :footer-props="{
                'items-per-page-options': [20, 30, 40, 50],
              }"
              class="elevation-1"
            >
            <template v-slot:[`item.active`]="{ item }">
        <v-simple-checkbox
          v-model="item.active"
          disabled
        ></v-simple-checkbox>
      </template>
            </v-data-table></v-card-text></v-card
      ></v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminPage",
  data() {
    return {
      limit: 100,
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
      users_headers: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Логин", value: "username" },
        { text: "Роль", value: "role_id" },
        { text: "Активный", value: "active" },
      ],
      log: [],
      users: [],
    };
  },
  methods: {
    async loadUsers() {
      await axios
        .get(
          "http://auth.vmvisioprom.kristal.local/api/database/users/?skip=0&limit=100",
          {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }
        )
        .then((response) => {
          this.users = response.data;
        });
    },
    async loadLog() {
      await axios
        .get(
          "http://auth.vmvisioprom.kristal.local/api/log/?limit=" + this.limit,
          {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }
        )
        .then((response) => {
          this.log = response.data;
        });
    },
  },
  watch: {
    limit: function () {
      this.loadLog();
    },
  },
  mounted() {
    this.loadLog();
    this.logTimeout = setInterval(() => {
      this.loadLog();
    }, 60000);
    this.loadUsers();
  },
  beforeDestroy() {
    console.log("destroy");
    clearInterval(this.logTimeout);
  },
};
</script>

<style>
.limit input::-webkit-outer-spin-button,
.limit input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.limit input[type="number"] {
  -moz-appearance: textfield;
}
</style>
