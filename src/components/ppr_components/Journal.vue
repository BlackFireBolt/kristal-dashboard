<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="4">
        <v-btn
          icon
          elevation="2"
          class="mb-2"
          outlined
          color="green"
          @click="loadJournal"
        >
          <v-icon>mdi-update</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          color="primary"
          dark
          class="mb-2"
          block
          @click="dialogAddRecord = !dialogAddRecord"
        >
          Новая запись
        </v-btn>
      </v-col>
    </v-row>
    <v-data-table
      class="mt-5"
      :headers="headersJournal"
      :items="dataJournal"
      :items-per-page="20"
      locale="ru"
      :loading="loadingJournal"
      loading-text="Загрузка... Пожалуйста, ждите"
      :footer-props="{
        'items-per-page-options': [20, 30, 40, 50],
      }"
    >
      <template v-slot:[`item.foreman_mark`]="{ item }">
        <v-simple-checkbox
          v-model="item.foreman_mark"
          disabled
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.admin_mark`]="{ item }">
        <v-simple-checkbox
          v-model="item.admin_mark"
          disabled
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.actions`] = "{ item }">
          <v-btn color="primary" @click="recordSigh(item)">Подписать</v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="dialogAddRecord" max-width="1200px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Новая запись в журнал</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formAddRecord" lazy-validation>
            <v-switch
              class="mb-2"
              v-model="recordEdit.work_canceled"
              color="red"
              label="Невыполнение"
              hide-details
            ></v-switch>
            <v-autocomplete
              v-model="recordEdit.equipment"
              :items="equipmentsList"
              item-text="name"
              item-value="value"
              label="Оборудование"
            >
            </v-autocomplete>
            <v-text-field
              label="Инвентарный номер"
              v-model="recordEdit.inventory_number"
            ></v-text-field>
            <v-select
              :disabled="jobCancel"
              :items="workTypes"
              v-model="recordEdit.work_type"
              label="Тип работ "
            ></v-select>
            <v-textarea
              v-model="recordEdit.reason"
              label="Причина"
            ></v-textarea>
            <v-textarea
              :disabled="jobCancel"
              v-model="recordEdit.work_performed"
              label="Выполненные работы"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeRecordSaveEdit()">
            Отмена
          </v-btn>
          <v-btn color="blue" dark @click="recordSaveEdit()"> Сохранить </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "Journal",
  props: {
    equipments: { type: Array, value: null },
    node_id: { type: Number, value: -1 },
    nodes: { type: Array, value: null },
  },
  data() {
    return {
      jobCancel: false,
      workTypes: ["ТО", "ТР", "К", "ВН", "Невыполнение"],
      recordEdit: {
        equipment: 0,
        inventory_number: "",
        work_type: "",
        reason: "",
        work_performed: "",
        author: "",
        master_mark: "",
        foreman_mark: false,
        admin_mark: false,
        work_canceled: false,
      },
      recordDefault: {
        equipment: 0,
        inventory_number: "",
        work_type: "",
        reason: "",
        work_performed: "",
        author: "",
        master_mark: "",
        foreman_mark: false,
        admin_mark: false,
        work_canceled: false,
      },
      dialogAddRecord: false,
      headersJournal: [
        { text: "ID", align: "start", value: "id" },
        { text: "Дата", value: "date" },
        { text: "Оборудование", value: "equipment.name" },
        { text: "Инвентарный номер", value: "inventory_number" },
        { text: "Вид работ", value: "work_type" },
        { text: "Причина", value: "reason" },
        { text: "Выполненные работы", value: "work_performed" },
        { text: "Выполнитель", value: "author" },
        { text: "Мастер цеха", value: "master_mark" },
        { text: "Начальник цеха", value: "foreman_mark" },
        { text: "Администратор", value: "admin_mark" },
        {  value: "actions", sortable: false}
      ],
      dataJournal: [],
      loadingJournal: false,
    };
  },
  watch: {
    "recordEdit.equipment": function (value) {
        if (value) {this.recordEdit.inventory_number = this.equipmentsList.find((x)=> x.value == value).inventory_number;}
        
    },
    "recordEdit.work_canceled": function (value) {
      if (value) {
        this.jobCancel = true;
        this.recordEdit.work_type = "Невыполнение";
        this.recordEdit.work_performed = "Невыполнение";
        this.recordEdit.reason = "";
      } else {
        this.jobCancel = false;
        this.recordEdit.reason = "";
        this.recordEdit.work_performed = "";
      }
    },
    "recordEdit.work_type": function (value) {
      switch (value) {
        case "Невыполнение":
          this.recordEdit.work_canceled = true;
          break;
        case "ВН":
          this.recordEdit.reason = "";
          this.recordEdit.work_performed = "";
          break;
        default:
          this.recordEdit.reason = "Согласно ППР";
      }
    },
  },
  computed: {
      loadUser() {
      return this.$store.getters.LOAD_USER;
    },
    equipmentsList() {
      let list = [];
      if (this.equipments) {
        for (let i = 0; i < this.equipments.length; i++) {
          list.push({
            name: this.equipments[i].name,
            value: this.equipments[i].id,
            inventory_number: this.equipments[i].inventory_number,
          });
        }
      }
      return list;
    },
  },
  methods: {
      recordSigh(item){
          switch(this.loadUser.rights) {
              case"":
          }
      },
    async recordSaveEdit() {
      this.recordEdit.author = this.loadUser.name;
      await axios
        .post("http://127.0.0.1:8000/api/journal/", this.recordEdit, {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Запись добавлена в журнал!",
          });
        });
      this.closeRecordSaveEdit();
    },
    closeRecordSaveEdit() {
      this.dialogAddRecord = false;
      this.loadJournal();
      this.$nextTick(() => {
        this.recordEdit = Object.assign({}, this.recordDefault);
      });
    },
    async loadJournal() {
      this.loadingJournal = true;
      await axios
        .get("http://127.0.0.1:8000/api/journal/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.dataJournal = response.data;
          this.loadingJournal = false;
        });
    },
  },
  mounted() {
    this.loadJournal();
  },
};
</script>
