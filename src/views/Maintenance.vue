<template>
  <div>
    <v-tabs v-model="tabMain" fixed-tabs>
      <v-tab>Графическое отображение</v-tab>
      <v-tab>Табличное отображение</v-tab>
    </v-tabs>
    <v-tabs-items class="mt-4" v-model="tabMain">
      <v-tab-item>
        <v-container
          ><v-row>
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
              >
              </v-select>
            </v-col> </v-row
        ></v-container>
        <v-row v-show="seen">
          <v-col cols="12" md="10">
            <v-sheet min-height="600" color="grey lighten-4">
              <div class="input-color" style="top: 5px">
                <v-btn icon elevation="2" class="mb-2" outlined color="green"
                  ><v-icon>mdi-update</v-icon></v-btn
                >
                <div class="ml-5 color-box" style="background-color: red"></div>
                - Требуется обслуживание
                <div
                  class="ml-5 color-box"
                  style="background-color: green"
                ></div>
                - Исправно
              </div>
              <v-btn
                class="fab-container"
                style="left: 10px"
                :color="editFlag ? 'success' : 'primary'"
                @click="editFlag = !editFlag"
                >Редактировать</v-btn
              >
              <p
                class="fab-container red--text"
                style="left: 35%"
                v-if="editFlag"
              >
                Режим редактирования
              </p>
              <v-container>
                <vue-pipeline
                  ref="pipeline"
                  :x="parseInt(graph.x)"
                  :y="parseInt(graph.y)"
                  :data="data"
                  :showArrow="graph.showArrow"
                  :ystep="parseInt(graph.ystep)"
                  :xstep="parseInt(graph.xstep)"
                  :lineStyle="graph.lineStyle"
                  @select="action"
                ></vue-pipeline>
              </v-container>
            </v-sheet>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="12" md="2">
            <v-card height="95%">
              <v-app-bar color="orange" flat dark dense>
                Список оборудования
              </v-app-bar>
              <v-card-text>
                <v-list style="max-height: 600px" class="overflow-y-auto">
                  <v-list-item
                    v-for="equipment in equipmentList"
                    :key="equipment.id"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        ><span
                          class="d-inline-block text-truncate"
                          style="max-width: 215px"
                          >{{ equipment.name }}</span
                        ><v-spacer></v-spacer>
                        <v-btn
                          icon
                          @click="
                            $router.push({
                              name: 'MaintenanceDetail',
                              params: {
                                id: 3,
                              },
                            })
                          "
                          ><v-icon> mdi-information </v-icon></v-btn
                        >
                        <v-btn icon><v-icon> mdi-pencil </v-icon></v-btn>
                        <v-btn icon
                          ><v-icon> mdi-delete </v-icon></v-btn
                        ></v-list-item-title
                      ><v-divider></v-divider>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>

                <div class="my-5 text-center">
                  <v-btn
                    elevation="4"
                    icon
                    color="indigo"
                    @click.stop="dialogAdd = true"
                    ><v-icon>mdi-note-plus-outline</v-icon></v-btn
                  >
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="dialogAdd" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Новое оборудование</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-from
              ref="formCreateEquipment"
              lazy-validation
              v-model="validateCreateEquipment"
            >
              <v-text-field
                v-model="equipmentNew.name"
                label="Имя"
              ></v-text-field>
              <v-select
                v-model="equipmentNew.status"
                :items="statuses"
                label="Статус"
                data-vv-name="Статус"
              ></v-select>
              <v-select
                v-model="equipmentNew.from"
                :items="fromList"
                item-text="name"
                item-value="value"
                label="От элемента"
                :disabled="fromList.length === 1 ? true : false"
                data-vv-name="От элемента"
              ></v-select>
              <v-select
                v-model="equipmentNew.to"
                :items="toList"
                item-text="name"
                item-value="value"
                label="К элементу"
                :disabled="toList.length === 1 ? true : false"
                data-vv-name="К элементу"
              ></v-select>
            </v-from>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="closeAdd">
            Отмена
          </v-btn>
          <v-btn color="blue darken-1" text @click="addEquipment">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialogDetailEdit"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="teal lighten-1">
          <v-btn icon dark @click="dialogDetailEdit = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ detailTitle }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn dark text @click="addEquipment"> Сохранить </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text>
          <v-container v-if="editFlag">
            <v-from
              ref="formEditEquipment"
              lazy-validation
              v-model="validateEditEquipment"
            >
              <v-text-field
                v-model="equipmentEdit.name"
                label="Имя"
              ></v-text-field>
              <v-select
                v-model="equipmentEdit.status"
                :items="statuses"
                label="Статус"
                data-vv-name="Статус"
              ></v-select>
              <v-list style="max-height: 600px" class="overflow-y-auto">
                <v-list-item v-for="link in equipmentEdit.next" :key="link.id">
                  <v-list-item-content>
                    <v-list-item-title
                      ><span
                        class="d-inline-block text-truncate"
                        style="max-width: 215px"
                        >{{ fromToList[link.id].name }}</span
                      ><v-spacer></v-spacer>
                      <v-btn
                        icon
                        @click="
                          $router.push({
                            name: 'MaintenanceDetail',
                            params: {
                              id: 3,
                            },
                          })
                        "
                        ><v-icon> mdi-information </v-icon></v-btn
                      >
                      <v-btn icon><v-icon> mdi-pencil </v-icon></v-btn>
                      <v-btn icon
                        ><v-icon> mdi-delete </v-icon></v-btn
                      ></v-list-item-title
                    ><v-divider></v-divider>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-from>
          </v-container>
          <v-container v-else> </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Maintenance",
  data() {
    return {
      validateCreateEquipment: false,
      validateEditEquipment: false,
      statuses: ["success", "running", "failure", "paused", "unstable"],
      dialogAdd: false,
      dialogDetailEdit: false,
      equipmentNew: {
        name: "",
        status: "",
        from: 0,
        to: 1,
      },
      equipmentEdit: {
        name: "",
        status: "",
        next: [],
      },
      equipmentEditDefault: {
        name: "",
        status: "",
        next: [],
      },
      equipmentNewDefault: {
        name: "",
        status: "",
        from: 0,
        to: 1,
      },
      graph: {
        x: 60,
        y: 85,
        xstep: 150,
        ystep: 100,
        data: 0,
        showArrow: true,
        lineStyle: "default",
        from: 0,
        to: 0,
      },
      data: [
        {
          name: "Start",

          status: "start",
          next: [{ index: 1, weight: 2 }],
        },

        { name: "End", status: "end", next: [] },
      ],
      editFlag: false,
      sendFlag: false,
      seen: false,
      width: 0,
      height: 0,
      top: 0,
      left: 0,
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
        this.seen = false;
        this.departmentSecond = null;
      }
      if (this.departmentThird !== null) {
        this.seen = false;
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
        this.seen = false;
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
    departmentThird: function (value) {
      console.log(value);
      if (value !== null) {
        this.seen = true;
        //this.loadEquipments();
      }
    },
  },
  computed: {
    detailTitle() {
      return this.editFlag
        ? "Редактировать информацию об оборудовании"
        : "Детальная информация об оборудовании";
    },
    fromList() {
      let list = [];
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].name !== "End") {
          list.push({ name: this.data[i].name, value: i });
        }
      }
      return list;
    },
    fromToList() {
      let list = [];
      for (let i = 0; i < this.data.length; i++) {
        list.push({ name: this.data[i].name, value: i });
      }
      return list;
    },
    toList() {
      let list = [];
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].name !== "Start") {
          list.push({ name: this.data[i].name, value: i });
        }
      }
      return list;
    },
    equipmentList() {
      let list = this.data;
      return list.slice(2);
    },
    departmentsFirstLevel() {
      let result = [];
      for (let i = 0; i < this.departments.length; i++) {
        if (this.departments[i].level === 0) result.push(this.departments[i]);
      }
      return result;
    },
  },
  methods: {
    action(node) {
      if (this.editFlag) {
        console.log(node);
        this.equipmentEdit = Object.assign({}, node);
        this.dialogDetailEdit = true;
      } else {
        this.dialogDetailEdit = true;
      }
    },
    closeAdd() {
      this.dialogAdd = false;
      this.$nextTick(() => {
        this.equipmentNew = Object.assign({}, this.equipmentNewDefault);
      });
    },
    async editEquipment() {
      this.$refs["pipeline"].render();
    },
    async addEquipment() {
      this.data.push({
        id: this.data.length - 1,
        name: this.equipmentNew.name,
        status: this.equipmentNew.status,
        next: [{ index: this.equipmentNew.to, weight: 2 }],
      });
      if (this.equipmentNew.from === 0 && this.data.length === 3) {
        this.data[this.equipmentNew.from].next = [
          { index: this.data.length - 1, weight: 2 },
        ];
      } else {
        this.data[this.equipmentNew.from].next.push({
          index: this.data.length - 1,
          weight: 2,
        });
      }
      this.$refs["pipeline"].render();
      this.closeAdd();
    },
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

<style>
.fab-container {
  position: absolute;
}

.input-color {
  position: relative;
  padding-left: 20px;
  margin-bottom: 5px;
}

.color-box {
  width: 10px;
  height: 10px;
  display: inline-block;
  background-color: #ccc;
  left: 5px;
  top: 5px;
}
</style>
