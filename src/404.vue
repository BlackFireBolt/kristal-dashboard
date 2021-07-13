<template>
  <v-layout justify-center align-center class="mt-4 pt-2">
    <div class="message">
      <p>
        Ошибка соединения с сервером
        <br />
        <small>Ведутся технические работы</small>
      </p>
      <br />
      <br />
      <v-btn large to="/"><v-icon>mdi-arrow-left</v-icon>ВЕРНУТЬСЯ</v-btn>
    </div>
  </v-layout>
</template>

<script>
export default {
  name: "Error",
};
</script>

<style scoped>
.message {
  text-align: center;
  position: relative;
}
.message p {
  font-size: 100px;
  color: green;
  padding-top: 90px;
  position: relative;
  z-index: 9;
  line-height: 100%;
}
.message p small {
  font-size: 40px;
  line-height: 100%;
  vertical-align: top;
}
</style>
