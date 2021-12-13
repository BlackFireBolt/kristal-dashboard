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
                  @select="openEditDetailEquipment"
                ></vue-pipeline>
              </v-container>
            </v-sheet>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="12" md="2">
            <v-card>
              <v-app-bar color="orange" flat dark dense>
                Список оборудования
              </v-app-bar>
              <v-card-text>
                <v-virtual-scroll
                  :items="equipments"
                  :item-height="70"
                  height="400"
                >
                  <template v-slot:default="{ item }">
                    <v-list-item
                      ><v-list-item-action>
                        <v-icon
                          small
                          @click="
                            $router.push({
                              name: 'MaintenanceDetail',
                              params: {
                                id: item.id,
                              },
                            })
                          "
                        >
                          mdi-information
                        </v-icon>
                        <v-icon
                          small
                          @click="
                            openDeleteEquipment(item)
                          "
                        >
                          mdi-delete
                        </v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.name }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    <v-divider></v-divider>
                  </template>
                </v-virtual-scroll>

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
            <v-form
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
              <v-divider class="my-5"></v-divider>
              <v-text-field
                v-model="equipmentNew.manufacturer"
                label="Производитель"
              ></v-text-field>
              <v-textarea
                v-model="equipmentNew.specifications"
                label="Технические характеристики"
              ></v-textarea>
              <v-select
                v-model="equipmentNew.department"
                :items="departments"
                item-value="id"
                item-text="name"
                label="Структурное подразделение"
                data-vv-name="Структурное подразделение"
              ></v-select>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentNew.factory_number"
                    label="Заводской номер"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentNew.inventory_number"
                    label="Инвентарный номер"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentNew.registration_number"
                    label="Регистрационный номер"
                  ></v-text-field
                ></v-col>
              </v-row>
              <v-text-field
                class="numpad"
                type="number"
                v-model="equipmentNew.operating_hours"
                label="Часы наработки"
              ></v-text-field>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="equipmentNew.year"
                    label="Год выпуска"
                    class="numpad"
                    type="number"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="datePick"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="equipmentNew.commissioning_date"
                        label="Дата ввода в эксплуатацию"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      locale="ru-ru"
                      :first-day-of-week="1"
                      v-model="equipmentNew.commissioning_date"
                      @input="datePick = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="closeAddEquipment">
            Отмена
          </v-btn>
          <v-btn color="blue darken-1" text @click="addEquipment">
            Сохранить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDetail" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Информация об оборудовании</span>
        </v-card-title>
        <v-card-text>
          <p>Наименование: {{ equipmentDetail.name }}</p>
          <p>Характеристики: {{ equipmentDetail.specifications }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click.stop="closeDetailEquipment">
            Отмена
          </v-btn>
          <v-btn
            color="blue"
            dark
            @click="
              $router.push({
                name: 'MaintenanceDetail',
                params: {
                  id: equipmentDetail.id,
                },
              })
            "
          >
            Подробнее
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogEdit" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Редактировать информацию об оборудовании</span>
        </v-card-title>
        <v-card-text class="mt-5">
          <v-container>
            <v-form
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
              <v-data-table
                :headers="linkHeaders"
                :items="linkTable"
                hide-default-footer
              >
                <template v-slot:top>
                  <v-toolbar flat>
                    <v-toolbar-title>Связи элементов</v-toolbar-title>
                    <v-divider class="mx-4" inset vertical></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog v-model="dialogAddLink" max-width="500px">
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          dark
                          class="mb-2"
                          v-bind="attrs"
                          v-on="on"
                        >
                          Новая связь
                        </v-btn>
                      </template>
                      <v-card>
                        <v-card-title>
                          <span class="text-h5">Добавить связь</span>
                        </v-card-title>

                        <v-card-text>
                          <v-container>
                            <v-select
                              v-model="linkAdd"
                              :items="toList"
                              item-text="name"
                              item-value="value"
                              label="К элементу"
                              :disabled="toList.length === 1 ? true : false"
                              data-vv-name="К элементу"
                            ></v-select>
                          </v-container>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="blue darken-1"
                            text
                            @click="closeAddLink"
                          >
                            Закрыть
                          </v-btn>
                          <v-btn color="blue darken-1" text @click="addLink">
                            Сохранить
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-toolbar>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="deleteLink(item)"> mdi-delete </v-icon>
                </template>
                <template v-slot:no-data>
                  <p>Нет доступных значений</p>
                </template>
              </v-data-table>
              <v-divider class="my-5"></v-divider>
              <v-text-field
                v-model="equipmentEdit.manufacturer"
                label="Производитель"
              ></v-text-field>
              <v-textarea
                v-model="equipmentEdit.specifications"
                label="Технические характеристики"
              ></v-textarea>
              <v-select
                v-model="equipmentEdit.department"
                :items="departments"
                item-value="id"
                item-text="name"
                label="Структурное подразделение"
                data-vv-name="Структурное подразделение"
              ></v-select>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentEdit.factory_number"
                    label="Заводской номер"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentEdit.inventory_number"
                    label="Инвентарный номер"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="equipmentEdit.registration_number"
                    label="Регистрационный номер"
                  ></v-text-field
                ></v-col>
              </v-row>
              <v-text-field
                class="numpad"
                type="number"
                v-model="equipmentEdit.operating_hours"
                label="Часы наработки"
              ></v-text-field>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="equipmentEdit.year"
                    label="Год выпуска"
                    class="numpad"
                    type="number"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="datePick"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="equipmentEdit.commissioning_date"
                        label="Дата ввода в эксплуатацию"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      locale="ru-ru"
                      :first-day-of-week="1"
                      v-model="equipmentEdit.commissioning_date"
                      @input="datePick = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditEquipment"> Отмена </v-btn>
          <v-btn color="blue" dark @click="editEquipment">
            Сохранить изменения
          </v-btn>
        </v-card-actions>
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
      datePick: false,
      dialogAddLink: false,
      dialogDeleteLink: false,
      linkAdd: null,
      validateCreateEquipment: false,
      validateEditEquipment: false,
      statuses: ["success", "running", "failure", "paused", "unstable"],
      dialogAdd: false,
      dialogEdit: false,
      dialogDetail: false,
      dialogDelete: false,
      equipmentNew: {
        name: "",
        status: "",
        from: 0,
        to: 1,
        manufacturer: "",
        specifications: "",
        department: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year: "",
        commissioning_date: "",
      },
      equipmentEdit: {
        name: "",
        status: "",
        next: [],
        manufacturer: "",
        specifications: "",
        department: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year: "",
        commissioning_date: "",
      },
      equipmentDetail: {},
      equipmentEditIndex: -1,
      equipmentEditDefault: {
        name: "",
        status: "",
        next: [],
        manufacturer: "",
        specifications: "",
        department: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year: "",
        commissioning_date: "",
      },
      equipmentNewDefault: {
        name: "",
        status: "",
        from: 0,
        to: 1,
        manufacturer: "",
        specifications: "",
        department: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year: "",
        commissioning_date: "",
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
      equipments: [],
      departmentFirst: null,
      departmentSecond: null,
      departmentThird: null,
      departmentsSecondLevel: [],
      departmentsThirdLevel: [],
      linkHeaders: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Удалить", value: "actions", sortable: false },
      ],
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
      if (value !== null) {
        this.seen = true;
        let department = this.departments.find((item) => item.id === value);
        if (department.diagram !== null) {
          this.data = JSON.parse(department.diagram);
        } else {
          this.data = [
            {
              name: "Start",

              status: "start",
              next: [{ index: 1, weight: 2 }],
            },
            { name: "End", status: "end", next: [] },
          ];
        }
        this.loadEquipments(value);
      }
    },
  },
  computed: {
    linkTable() {
      let data = [];
      if (this.equipmentEditIndex > -1) {
        for (let i = 0; i < this.equipmentEdit.next.length; i++) {
          data.push({
            id: i + 1,
            name: this.data[this.equipmentEdit.next[i].index].name,
            index: i,
          });
        }
      }
      return data;
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
    closeDetailEquipment() {
      this.dialogDetail = false;
      this.$nextTick(() => {
        this.equipmentDetail = {};
      });
    },
    openEditDetailEquipment(node) {
      if (this.editFlag) {
        console.log(node);
        this.equipmentEditIndex = this.equipments.findIndex(
          (item) => item.name === node.name
        );
        this.equipmentEdit = Object.assign({}, this.equipments[this.equipmentEditIndex]);
        this.dialogEdit = true;
      } else {
        this.equipmentDetail = this.equipments.find(
          (item) => item.name === node.name
        );
        this.dialogDetail = true;
      }
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
    async loadEquipments(id) {
      await axios
        .get("http://127.0.0.1:8000/api/equipment-filter/" + id + "/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.equipments = response.data;
        });
    },
    //-------------------------------------------------------------
    openDeleteEquipment(item) {
      this.equipmentEditIndex = this.roles.indexOf(item);
      this.equipmentEdit = Object.assign({}, item);
      this.dialogDelete = true;
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
      console.log(JSON.stringify(this.data));
      await axios
        .post("http://127.0.0.1:8000/api/equipment/", this.equipmentNew, {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then(() => {
          let department = this.departments.find(
            (item) => item.id === this.equipmentNew.department
          );
          department.diagram = JSON.stringify(this.data);
          department.diagram = department.diagram.replace(/\\/g, "");
          axios.put(
            "http://127.0.0.1:8000/api/department/" +
              this.equipmentNew.department +
              "/",
            department,
            {
              headers: { Accept: "application/json" },
              timeout: 1000 * 5,
            }
          );
        });
      this.$refs["pipeline"].render();
      this.closeAddEquipment();
    },
    closeAddEquipment() {
      this.dialogAdd = false;
      this.$nextTick(() => {
        this.equipmentNew = Object.assign({}, this.equipmentNewDefault);
      });
    },
    async editEquipment() {
      let dataIndex = this.data.findIndex(
        (item) => item.name === this.equipments[this.equipmentEditIndex]
      );
      Object.assign(
        this.equipments[this.equipmentEditIndex],
        this.equipmentEdit
      );
      this.data[dataIndex].name = this.equipmentEdit.name;
      this.data[dataIndex].next = this.equipmentEdit.next;
      let department = this.departments.find(
        (item) => item.id === this.equipmentEdit.department
      );
      department.diagram = JSON.stringify(this.data);
      department.diagram = department.diagram.replace(/\\/g, "");
      await axios
        .put(
          "http://127.0.0.1:8000/api/equipment/" + this.equipmentEdit.id + "/",
          this.equipmentEdit,
          {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }
        )
        .then((response) => {
          console.log(response);

          axios.put(
            "http://127.0.0.1:8000/api/department/" +
              this.equipmentEdit.department +
              "/",
            department,
            {
              headers: { Accept: "application/json" },
              timeout: 1000 * 5,
            }
          );
        });
      this.$refs["pipeline"].render();
      this.closeEditEquipment();
    },
    closeEditEquipment() {
      this.dialogEdit = false;
      this.$nextTick(() => {
        this.equipmentEdit = Object.assign({}, this.equipmentEditDefault);
        this.equipmentEditIndex = -1;
      });
    },
    async deleteEquipment() {
      let dataIndex = this.data.findIndex(
        (item) => item.name === this.equipments[this.equipmentEditIndex]
      );
      this.data[dataIndex].splice(this.equipmentEditIndex, 1);
      let department = this.departments.find(
        (item) => item.id === this.equipmentEdit.department
      );
      department.diagram = JSON.stringify(this.data);
      department.diagram = department.diagram.replace(/\\/g, "");
      await axios
        .delete(
          "http://127.0.0.1:8000/api/equipment/" + this.equipmentEdit.id + "/",
          { headers: { Accept: "application/json" } }
        )
        .then((response) => {
          console.log(response);

          axios.put(
            "http://127.0.0.1:8000/api/department/" +
              this.equipmentEdit.department +
              "/",
            department,
            {
              headers: { Accept: "application/json" },
              timeout: 1000 * 5,
            }
          );
        });
      this.$refs["pipeline"].render();
      this.closeDeleteEquipment();
    },
    closeDeleteEquipment() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.equipmentEdit = Object.assign({}, this.equipmentEditDefault);
        this.equipmentEditIndex = -1;
      });
    },
    async addLink() {
      if (this.equipmentEdit && this.addLink) {
        this.equipmentEdit.next.push({ index: this.linkAdd, weight: 2 });
      }
      this.closeAddLink();
    },
    closeAddLink() {
      this.dialogAddLink = false;
      this.$nextTick(() => {
        this.linkAdd = null;
      });
    },
    async deleteLink(item) {

      this.equipmentEdit.next.splice(item.index, 1);
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

.numpad input::-webkit-outer-spin-button,
.numpad input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.numpad input[type="number"] {
  -moz-appearance: textfield;
}
</style>
