<template>
  <div>
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
  created() {
    
      let user_channels = this.$store.getters.LOAD_USER.channels;
      if (user_channels.length === 1) {
        this.$store.dispatch("SWITCH_CHANNEL", user_channels[0]);
      } else {
        let channel = JSON.parse(this.$cookie.get("channel"));
        if (channel) {
          this.$store.dispatch("SWITCH_CHANNEL", channel);
        }
      }
    
  },
  beforeDestroy() {
    this.$store.dispatch("CLOSE_SSE");
  },
};
</script>
