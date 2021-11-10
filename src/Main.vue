<template>
  <div>
    <v-overlay :value="loadingStatus">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
    <navigation />
    <bar />
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer app>
      <footer-comp />
    </v-footer>
    <notifications position="bottom right" />
  </div>
</template>

<script>
import Navigation from "./components/Navigation.vue";
import Bar from "./components/Bar.vue";
import Footer from "./components/Footer.vue";

export default {
  components: { Navigation, Bar, "footer-comp": Footer },
  name: "Main",
  computed: {
    loadingStatus() {
      return this.$store.getters.LOAD_LOADER;
    },
  },
  created() {
    if (this.$store.getters.LOAD_SSE === null) {
      let user_channels = this.$store.getters.LOAD_USER.channels;
      if (user_channels === 1) {
        this.$store.dispatch("SWITCH_CHANNEL", user_channels[0]);
      } else {
        let channel = JSON.parse(this.$cookie.get("channel"));
        if (channel) {
          this.$store.dispatch("SWITCH_CHANNEL", channel);
        }
      }
    }
  },
  beforeDestroy() {
    this.$store.dispatch("CLOSE_SSE");
  },
};
</script>
