<template>
  <v-sheet color="blue-grey lighten-5" width="100%">
    <v-container>
      <div class="text-h6">Лог событий:</div>
      <v-data-table
        dense
        height="200px"
        :items="loadAccidents"
        :headers="headers"
        show-select
        item-key="id"
        v-model="selected"
        :items-per-page="5"
      >
        <template v-slot:top
          ><v-btn
            icon
            class="mx-3"
            :disabled="selected.length < 2"
            @click="groupItem()"
            ><v-icon>mdi-arrow-collapse</v-icon></v-btn
          >
          <v-btn
            icon
            class="mx-3"
            v-bind:color="filter == true ? 'success' : ''"
            @click="filter = !filter"
            ><v-icon>mdi-filter</v-icon></v-btn
          ></template
        >
        <template v-slot:item.actions="{ item }">
          <v-icon small class="mx-2" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon
            small
            class="mx-2"
            @click="ungroupItem(item)"
            v-if="item.childs.length > 0"
            >mdi-arrow-expand</v-icon
          >
        </template>
        <template v-slot:no-data>
          <p>Событий нет</p>
        </template>
      </v-data-table>
      <v-dialog v-model="dialog" width="500">
        <v-card>
          <v-card-title class="text-h5 grey lighten-2">
            Изменить комментарий
          </v-card-title>

          <v-card-text>
            <v-select
              v-model="editedItem.message"
              :items="accidentsType"
              label="Причины простоев"
              item-text="name"
              item-value="name"
            >
            </v-select>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Отмена </v-btn>
              <v-btn color="blue darken-1" text @click="save">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div align="right">
        <v-btn class="mt-2"><v-icon>mdi-upload</v-icon>Отправить</v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<script>
import { AccidentStatus } from "../plugins/utils.js";

export default {
  name: "Accidents",
  data() {
    return {
      accidentSelected: "",
      selected: [],
      filter: false,
      dialog: false,
      editedIndex: null,
      editedItem: {
        time: [],
        message: "",
        worker: "",
        id: null,
        childs: [],
      },
      defaultItem: {
        time: [],
        message: "",
        worker: "",
        id: null,
        childs: [],
      },
      headers: [
        { text: "Время", value: "time", aligh: "start", sortable: false },
        {
          text: "Сообщение",
          value: "message",
          filter: (value) => {
            if (this.filter) {
              return value == "";
            } else {
              return true;
            }
          },
        },
        { text: "Работник", value: "worker" },
        { text: "Действия", value: "actions", sortable: false },
      ],
      accidents: [],
      accidentsType: [
        { header: "Плановые" },
        { name: "Смена ассортимента", group: "Плановые" },
        { name: "Переход на другую линию", group: "Плановые" },
        { name: "Подготовка линии розлива", group: "Плановые" },
        { name: "Регулировка автоматов в процессе розлива", group: "Плановые" },
        { name: "Замена вспомогательных материалов", group: "Плановые" },
        { divider: true },
        { header: "Незапланнированные" },
        {
          name: "Регулировка настроек оборудования помарочного учета",
          group: "Незапланнированные",
        },
        { name: "Остановка по КИП", group: "Незапланнированные" },
        { name: "Поломка оборудования, конвеера", group: "Незапланнированные" },
        {
          name: "Остановка по причине некачественных вспомогательных матери",
          group: "Незапланнированные",
        },
        { name: "Падение/бой бутылок на линии", group: "Незапланнированные" },
        { name: "Прочее", group: "Незапланнированные" },
      ],
    };
  },
  props: {
    line_key: String,
    default: null,
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  computed: {
    loadAccidents() {
      let lines = this.$store.getters.LOAD_LINES;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].key === this.line_key) {
          return lines[i].accidents;
        }
      }
      return false;
    },
  },
  methods: {
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = null;
      });
    },
    groupItem() {
      let accidents = this.loadAccidents;
      let grouped = {
        id: this.selected[0].id,
        message: "",
        worker: this.$store.getters.LOAD_USER.name,
        childs: [],
        time: [],
        isSelectable: false,
      };
      for (let i = 0; i < this.selected.length; i++) {
        accidents.splice(accidents.indexOf(this.selected[i]), 1);
        grouped.childs.push(this.selected[i].id);
        grouped.time.push(this.selected[i].time);
      }
      grouped.worker = this.$store.getters.LOAD_USER.name;
      accidents.push(grouped);
      this.$store.commit("SET_ACCIDENTS", {key: this.line_key, accidents: accidents});
      this.selected = [];
    },
    ungroupItem(item) {
      let accidents = this.loadAccidents;
      accidents.splice(accidents.indexOf(item), 1);
      for (let i = 0; i < item.childs.length; i++) {
        accidents.push({
          id: item.childs[i],
          time: [item.time[i]],
          worker: this.$store.getters.LOAD_USER.name,
          message: "",
          childs: [],
        });
      }
      this.$store.commit("SET_ACCIDENTS", {key: this.line_key, accidents: accidents});
    },
    editItem(item) {
      this.editedIndex = this.loadAccidents.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.worker = this.$store.getters.LOAD_USER.name;
      this.dialog = true;
    },
    save() {
      let accidents = this.loadAccidents;
      if (this.editedIndex !== null) {
        Object.assign(accidents[this.editedIndex], this.editedItem);
      }
      console.log(AccidentStatus(accidents))
      this.$store.commit("SET_ACCIDENTS", {key: this.line_key, accidents: accidents, status: AccidentStatus(accidents)});
      this.close();
    },
  },
};
</script>
