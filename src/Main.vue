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
      <footer-comp :status="status" :statusColor="statusColor" />
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
  data() {
    return {
      counter: 0,
    };
  },
  computed: {
    status() {
      return this.$store.getters.LOAD_STATUS;
    },
    statusColor() {
      return this.$store.getters.LOAD_STATUS_COLOR;
    },
    loadingStatus() {
      return this.$store.getters.LOAD_LOADER;
    },
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
    linesList() {
      return this.$store.getters.LOAD_LINES;
    },
  },
  created() {
    this.$store.commit("SET_LOADER", true);
  },
  mounted() {
    var channels = [];
    if (this.$store.getters.LOAD_USER.superuser) {
      channels = ["c1_s1", "c2_s2", "c2_s3"];
    } else {
      channels = this.$store.getters.LOAD_USER.channels;
    }
    for (let i = 0; i < channels.length; i++) {
      this.$store.dispatch("GET_LOAD_DATA", channels[i]).then(() => {
        this.$store.dispatch("GET_LOAD_STREAM", channels[i]).then(() => {
          this.$store.commit("SET_LOADER", false);
        });
      });
    }
    this.$store.commit("SET_LOADER", false);
  },
  beforeDestroy() {
    this.$store.dispatch("CLOSE_SSE");
  },
};
</script>
