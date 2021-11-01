<template>
  <v-navigation-drawer v-model="drawer" stateless app :mini-variant="mini">
    <v-list-item class="px-2">
      <v-list-item-avatar>
        <v-img src="../assets/img/122290.gif"></v-img>
      </v-list-item-avatar>

      <v-list-item-title class="title"> Минск КРИСТАЛЛ</v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <v-list dense nav rounded>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        @click="drawer = !drawer"
      >
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-dialog transition="dialog-top-transition" max-width="600">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-package-down</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Архив</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:default="dialog">
          <v-card>
            <v-toolbar color="primary" dark>Архив графиков и событий</v-toolbar>
            <v-card-text>
              <div class="text-h6 pa-5">
                Выберите дату и линию для отображения
              </div>
              <v-menu
                v-model="pickMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    label="Выберите дату"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="date"
                  @input="pickMenu = false"
                ></v-date-picker>
              </v-menu>
              <v-select
                v-model="line_key"
                :items="lineSelect"
                item-text="name"
                item-value="key"
                label="Выберите линию"
                filled
                required
              >
              </v-select>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn text @click="dialog.value = false">Отмена</v-btn>
              <v-btn color="success" @click="dialog.value = false">Поиск</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <v-dialog transition="dialog-top-transition" max-width="600">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-bind="attrs" v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-television-classic</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Управление телевизорами</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <template v-slot:default="dialog">
          <v-card>
            <v-toolbar color="primary" dark>Архив графиков и событий</v-toolbar>
            <v-card-text>
              <div class="text-h6 pa-5">
                Выберите дату и линию для отображения
              </div>
              <v-menu
                v-model="pickMenu"
                :close-on-content-click="false"
                :nudge-right="40"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="date"
                    label="Выберите дату"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="date"
                  @input="pickMenu = false"
                ></v-date-picker>
              </v-menu>
              <v-select
                v-model="line_key"
                :items="lineSelect"
                item-text="name"
                item-value="key"
                label="Выберите линию"
                filled
                required
              >
              </v-select>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn text @click="dialog.value = false">Отмена</v-btn>
              <v-btn color="success" @click="dialog.value = false">Поиск</v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </v-list>
    <v-divider></v-divider>
    <v-list dense nav rounded v-if="(loadUser.rights & 448) == 448">
      <v-list-item to="/adminpage">
        <v-list-item-icon>
          <v-icon>mdi-account-tie</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Администрирование</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "Navigation",

  data() {
    return {
      items: [
        { title: "Панель", icon: "mdi-view-dashboard", to: "/" },
        { title: "ППР", icon: "mdi-cog-clockwise", to: "/maintenance" },
        {
          title: "Метрика",
          icon: "mdi-calculator-variant-outline",
          to: "/metrics",
        },
      ],
      right: null,
      date: new Date().toISOString().substr(0, 10),
      line_key: null,
      pickMenu: false,
    };
  },
  computed: {
    mini() {
      return this.$vuetify.breakpoint.mdAndDown;
    },
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(value) {
        this.$store.commit("TOGGLE_DRAWER", value);
      },
    },
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
    lineSelect() {
      let lines = this.$store.getters.LOAD_LINES;
      let result = [];
      for (var i = 0; i < lines.length; i++) {
        for (var j = 0; j < lines[i].length; j++) {
          result.push({
            key: lines[i][j].key,
            name: "Линия №" + lines[i][j].line_id,
          });
        }
      }
      return result;
    },
  },
};
</script>
