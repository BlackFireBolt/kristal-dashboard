<template>
  <div>
    <v-chip class="mb-2 mr-3" color="success" pill v-if="(status & 1) == 1"
      ><v-icon left>mdi-check-decagram</v-icon>Работает</v-chip
    >
    <v-chip class="mb-2 mr-3" pill v-else
      ><v-icon left>mdi-check-decagram</v-icon>Отключена</v-chip
    >
    <v-chip class="mb-2 mr-3" pill color="success" v-if="(status & 2) == 2"
      ><v-icon left>mdi-check-decagram</v-icon>Данные загружены</v-chip
    ><v-chip class="mb-2 mr-3" pill color="error" v-else
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Данные не
      загружены</v-chip
    >
    <v-chip class="mb-2 mr-3" color="info" pill v-if="(( status & 1) == 1 ) && statusPv"
      >Отработано: {{statusPv}}<span v-if="statusSp">/{{statusSp}}</span></v-chip
    >
    <v-chip class="mb-2 mr-3" pill v-if="status == -1"
      ><v-icon left>mdi-wrench</v-icon>Состояние неизвестно</v-chip
    >
    <v-chip class="mb-2 mr-3" pill color="warning" v-if="(status & 4) == 4"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Данные загружены, линия
      не работает</v-chip
    ><v-chip class="mb-2 mr-3" pill color="warning" v-if="(status & 8) == 8"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Память загружена на
      75%</v-chip
    >
    <v-chip class="mb-2 mr-3" pill color="error" v-if="(status & 16) == 16"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Память загружена на
      99%</v-chip
    >
    <v-chip class="mb-2 mr-3" pill color="error" v-else-if="(status & 32) == 32"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Авария</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="(status & 64) == 64"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Неподтвержденное
      происшествие</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="(status & 128) == 128"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Пониженная
      производительность</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="(status & 256) == 256"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Простой 5 минут</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="(status & 512) == 512"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Простой 15 минут</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="(status & 1024) == 1024"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Получение данных</v-chip
    >
    <v-chip
      class="mb-2 mr-3"
      pill
      color="warning"
      v-if="accident"
      ><v-icon left>mdi-alert-decagram-outline</v-icon>Незаполненное событие</v-chip
    >
  </div>
</template>

<script>
export default {
  name: "Status",
  props: {
    status: {
      type: Number,
      default: null,
    },
    statusPv: {
      type: Number,
      default: null,
    },
    statusSp: {
      type: Number,
      default: null,
    },
    accident: {
      type: Boolean,
      default: false,
    }
  },
  
};
</script>
