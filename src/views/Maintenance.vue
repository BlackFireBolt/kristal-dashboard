<template>
  <div>
    <v-tabs v-model="tabMain" fixed-tabs>
      <v-tab>Графическое отображение</v-tab>
      <v-tab>Табличное отображение</v-tab>
    </v-tabs>
    <v-tabs-items class="mt-4" v-model="tabMain">
      <v-tab-item>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              solo
              v-model="departmentFirst"
              :items="departmentsFirstLevel"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              solo
              v-if="departmentFirst"
              v-model="departmentSecond"
              :items="departmentsSecondLevel"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              solo
              v-if="departmentSecond"
              v-model="departmentThird"
              :items="departmentsThirdLevel"
              item-text="name"
              item-value="id"
            ></v-select>
          </v-col>
          <img src="https://i.stack.imgur.com/q9ZX6.png" usemap="#housemap">

<map name="housemap">
  <area shape="circle" coords="0,0,82,126" href="1.htm" alt="1">
  <area shape="circle" coords="190,58,30" href="2.htm" alt="2">
  <area shape="circle" coords="90,58,30" href="3.htm" alt="3">
  <area shape="circle" coords="90,58,30" href="4.htm" alt="4">
</map>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Maintenance",
  data() {
    return {
      tabMain: null,
      departments: [],
      departmentFirst: null,
      departmentSecond: null,
      departmentThird: null,
      departmentsSecondLevel: [],
      departmentsThirdLevel: [],
    };
  },
  watch: {
    departmentFirst: function (value) {
      if (this.departmentSecond !== null) {
        this.departmentSecond = null;
      }
      if (this.departmentThird !== null) {
        this.departmentThird = null;
      }
      let result = [];
      for (let i = 0; i < this.departments.length; i++) {
        if (this.departments[i].parent == value) {
          result.push(this.departments[i]);
        }
      }
      this.departmentsSecondLevel = result;
    },
    departmentSecond: function (value) {
      if (this.departmentThird !== null) {
        this.departmentThird = null;
      }
      let result = [];
      for (let i = 0; i < this.departments.length; i++) {
        if (this.departments[i].parent == value) {
          result.push(this.departments[i]);
        }
      }
      this.departmentsThirdLevel = result;
    },
  },
  computed: {
    departmentsFirstLevel() {
      let result = [];
      for (let i = 0; i < this.departments.length; i++) {
        if (this.departments[i].level === 0) result.push(this.departments[i]);
      }
      return result;
    },
  },
  methods: {
    async loadDepartments() {
      await axios
        .get("http://127.0.0.1:8000/api/department/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.departments = response.data;
        });
    },
  },
  mounted() {
    this.loadDepartments();
  },
};
</script>
