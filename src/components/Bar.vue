<template>
  <v-app-bar color="teal lighten-1" dark app hide-on-scroll>
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

    <v-toolbar-title
      >{{ loadDataList.dc }} - {{ loadDataList.site }} -
      {{ this.$route.meta.title }}
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <v-menu left bottom min-width="256">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">
              {{ loadUser.name }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ loadUser.username }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click="logout" link>
          <v-list-item-icon>
            <v-icon>mdi-exit-to-app</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Выйти</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  name: "Bar",
  computed: {
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(value) {
        this.$store.commit("TOGGLE_DRAWER", value);
      },
    },
    loadDataList() {
      return this.$store.getters.LOAD_DATA;
    },
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
  },
  methods: {
    async logout() {
      await this.$store.dispatch("LOGOUT");
      this.$router.push("/login");
    },
  },
};
</script>
