<template>
  <div>
    <v-tabs v-model="tabMain" fixed-tabs>
      <v-tab>Графическое отображение</v-tab>
      <v-tab>Табличное отображение</v-tab>
      <v-tab>Журнал техобслуживания</v-tab>
    </v-tabs>
    <v-tabs-items class="mt-4" v-model="tabMain">
      <v-tab-item>
        <v-container
          ><v-row>
            <v-col cols="12" md="4">
              <v-select
                outlined
                v-model="departmentFirst"
                :items="departmentsFirstLevel"
                item-text="name"
                item-value="id"
                label="Выберите цех"
                :disabled="departmentsFirstLevel === [] ? true : false"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                outlined
                v-if="departmentFirst"
                v-model="departmentSecond"
                :items="departmentsSecondLevel"
                item-text="name"
                :disabled="departmentsSecondLevel === [] ? true : false"
                label="Выберите участок"
                item-value="id"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                outlined
                v-if="departmentSecond"
                v-model="departmentThird"
                :items="departmentsThirdLevel"
                item-text="name"
                :disabled="departmentsThirdLevel === [] ? true : false"
                label="Выберите линию"
                item-value="id"
              >
              </v-select>
            </v-col> </v-row
        ></v-container>
        <v-row v-show="seen">
          <v-col cols="12" md="9">
            <v-sheet min-height="600" color="grey lighten-4">
              <div class="input-color" style="top: 5px">
                <v-btn
                  icon
                  elevation="2"
                  class="mb-2"
                  outlined
                  color="green"
                  @click="reload"
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
                :color="editFlag ? 'orange lighten-3' : 'primary'"
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
                <VueDiagram
                  v-show="false"
                  divClassName="vue-diagram"
                  :initDiagram="initDiagram"
                  :nodeDataArray="nodeDataArray"
                  :linkDataArray="linkDataArray"
                />
              </v-container>
            </v-sheet>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="12" md="3">
            <v-card>
              <v-app-bar color="teal lighten-1" flat dark dense>
                Список оборудования
              </v-app-bar>
              <v-card-text>
                <v-virtual-scroll
                  :items="equipments"
                  :item-height="70"
                  height="400"
                >
                  <template v-slot:default="{ item }">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          <v-chip small color="teal lighten-4" class="mx-1"
                            ><v-icon left> mdi-cogs </v-icon>Узлы:
                            {{ item.nodes ? item.nodes.length : 0 }}</v-chip
                          >
                          <v-chip small color="cyan lighten-4" class="mx-1"
                            ><v-icon left> mdi-layers-triple </v-icon>Материалы:
                            {{
                              item.nodes.materials
                                ? item.nodes.materials.length
                                : 0
                            }}</v-chip
                          >
                        </v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-menu offset-y rounded="b-xl">
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn depressed small v-bind="attrs" v-on="on">
                              Действия
                              <v-icon color="orange darken-4" right>
                                mdi-open-in-new
                              </v-icon>
                            </v-btn>
                          </template>
                          <v-list>
                            <v-list-item @click="openDetailEquipment(item)">
                              <v-list-item-title>
                                <v-icon small> mdi-information </v-icon>
                                Подробнее
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openEditSubjects(item)">
                              <v-list-item-title>
                                <v-icon small> mdi-plus-box </v-icon>
                                Управление узлами
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openEditEquipment(item)">
                              <v-list-item-title>
                                <v-icon small> mdi-pencil </v-icon>
                                Редактирование
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item @click="openDeleteEquipment(item)">
                              <v-list-item-title>
                                <v-icon small> mdi-delete </v-icon>Удаление
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                      </v-list-item-action>
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
      <v-tab-item>
        <v-container fluid>
          <v-btn
            @click="load"
            icon
            elevation="2"
            class="mb-2"
            outlined
            color="green"
            ><v-icon>mdi-update</v-icon></v-btn
          >
          <v-expansion-panels v-model="panel" multiple>
            <v-expansion-panel>
              <v-expansion-panel-header disable-icon-rotate
                >Оборудование<template v-slot:actions>
                  <v-icon> mdi-cube-outline </v-icon>
                </template></v-expansion-panel-header
              >
              <v-expansion-panel-content>
                <v-card class="mt-5">
                  <v-card-text>
                    <v-data-table
                      :headers="headersEquipment"
                      :items="equipmentsAll"
                      :items-per-page="20"
                      locale="ru"
                      :loading="loadingEquipment"
                      loading-text="Загрузка... Пожалуйста, ждите"
                      :footer-props="{
                        'items-per-page-options': [20, 30, 40, 50],
                      }"
                    >
                      <template v-slot:no-data> Нет данных </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header disable-icon-rotate
                >Узлы<template v-slot:actions>
                  <v-icon> mdi-cogs </v-icon>
                </template></v-expansion-panel-header
              >
              <v-expansion-panel-content>
                <v-card class="mt-5">
                  <v-card-text>
                    <v-data-table
                      :headers="headersNode"
                      :items="nodesAll"
                      :items-per-page="20"
                      locale="ru"
                      :loading="loadingNode"
                      loading-text="Загрузка... Пожалуйста, ждите"
                      :footer-props="{
                        'items-per-page-options': [20, 30, 40, 50],
                      }"
                    >
                      <template v-slot:no-data> Нет данных </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header disable-icon-rotate
                >Материалы<template v-slot:actions>
                  <v-icon> mdi-layers-triple </v-icon>
                </template></v-expansion-panel-header
              >
              <v-expansion-panel-content>
                <v-card class="mt-5">
                  <v-card-text>
                    <v-data-table
                      :headers="headersMaterial"
                      :items="materialsAll"
                      :items-per-page="20"
                      locale="ru"
                      :loading="loadingMaterial"
                      loading-text="Загрузка... Пожалуйста, ждите"
                      :footer-props="{
                        'items-per-page-options': [20, 30, 40, 50],
                      }"
                    >
                      <template v-slot:no-data> Нет данных </template>
                    </v-data-table>
                  </v-card-text>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
      </v-tab-item>
      <v-tab-item>
        <journal :equipments="equipmentsAll" />
      </v-tab-item>
    </v-tabs-items>
    <v-dialog v-model="dialogAdd" max-width="1200px">
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
                v-if="equipmentNew.from !== -1"
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
                v-model="equipmentNew.department_id"
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
                    v-model="equipmentNew.year_of_issue"
                    label="Год выпуска"
                    class="numpad"
                    type="number"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="datePickNew"
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
          <v-btn color="blue darken-1" dark @click="addEquipment">
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
    <v-dialog v-model="dialogEdit" max-width="1200px">
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
              <v-data-table
                :headers="linkHeaders"
                :items="links"
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
                              label="Выберите оборудование"
                              :disabled="toList === [] ? true : false"
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
                v-model="equipmentEdit.department_id"
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
                    v-model="equipmentEdit.year_of_issue"
                    label="Год выпуска"
                    class="numpad"
                    type="number"
                  ></v-text-field
                ></v-col>
                <v-col cols="12" md="6">
                  <v-menu
                    v-model="datePickEdit"
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
          <v-btn color="blue darken-1" text @click="closeEditEquipment">
            Отмена
          </v-btn>
          <v-btn color="blue" dark @click="editEquipment">
            Сохранить изменения
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Подтверждение удаления</v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDeleteEquipment"
            >Отмена</v-btn
          >
          <v-btn color="blue darken-1" dark @click="deleteEquipment"
            >Подтвердить</v-btn
          >
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogSubjects" max-width="1200px">
      <v-card min-height="600px">
        <v-card-title>
          <span class="text-h5">Редактирование узлов и материалов</span>
        </v-card-title>
        <v-card-subtitle class="mt-2">{{ equipmentEdit.name }}</v-card-subtitle>
        <v-card-text class="mt-5">
          <v-container>
            <nodes :equipment_id="equipmentEdit.id" :equipments="equipments" />
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" dark @click="closeEditSubjects">
              Отмена
            </v-btn>
          </v-card-actions>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { VueDiagram } from "gojs-vue";
import go from "gojs";
import axios from "axios";
import Nodes from "../components/ppr_components/Nodes.vue";
import Journal from "../components/ppr_components/Journal.vue";

export default {
  name: "Maintenance",
  components: { Nodes, VueDiagram, Journal },
  data() {
    return {
      panel: [0],
      dialogAddRecord: false,
      loadingEquipment: true,
      loadingNode: true,
      loadingMaterial: true,
      equipmentsAll: [],
      nodesAll: [],
      materialsAll: [],
      headersMaterial: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Код материала", value: "code" },
        { text: "Узел", value: "node.name" },
        { text: "Цикл переработки", value: "overhaul_cycle" },
        { text: "Количество", value: "count" },
      ],
      headersNode: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Код узла", value: "code" },
        { text: "Оборудование", value: "equipment.name" },
      ],
      headersEquipment: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Производитель", value: "manufacturer" },
        { text: "Характеристики", value: "specifications" },
        { text: "Отделение", value: "department.name" },
        { text: "Заводской номер", value: "factory_number" },
        { text: "Инвентарный номер", value: "inventory_number" },
        { text: "Регистрационный номер", value: "registration_number" },
        { text: "Часы наработки", value: "operating_hours" },
        { text: "Год выпуска", value: "year_of_issue" },
        { text: "Дата ввода в эксплуатацию", value: "commissioning_date" },
      ],
      dialogSubjects: false,
      nodeDataArray: [
        { key: "P1", category: "Process", pos: "150 120", text: "Process" },
        { key: "P2", category: "Process", pos: "330 320", text: "Tank" },
        { key: "V1", category: "Valve", pos: "270 120", text: "V1" },
        { key: "P3", category: "Process", pos: "150 420", text: "Pump" },
        {
          key: "V2",
          category: "Valve",
          pos: "150 280",
          text: "VM",
          angle: 270,
        },
        {
          key: "V3",
          category: "Valve",
          pos: "270 420",
          text: "V2",
          angle: 180,
        },
        {
          key: "P4",
          category: "Process",
          pos: "450 140",
          text: "Reserve Tank",
        },
        { key: "V4", category: "Valve", pos: "390 60", text: "VA" },
        { key: "V5", category: "Valve", pos: "450 260", text: "VB", angle: 90 },
      ],
      linkDataArray: [
        { from: "P1", to: "V1" },
        { from: "P3", to: "V2" },
        { from: "V2", to: "P1" },
        { from: "P2", to: "V3" },
        { from: "V3", to: "P3" },
        { from: "V1", to: "V4" },
        { from: "V4", to: "P4" },
        { from: "V1", to: "P2" },
        { from: "P4", to: "V5" },
        { from: "V5", to: "P2" },
      ],
      links: [],
      datePickNew: false,
      datePickEdit: false,
      dialogAddLink: false,
      dialogDeleteLink: false,
      linkAdd: null,
      validateCreateEquipment: false,
      validateEditEquipment: false,
      dialogAdd: false,
      dialogEdit: false,
      dialogDetail: false,
      dialogDelete: false,
      equipmentNew: {
        name: "",
        from: 0,
        to: 1,
        manufacturer: "",
        specifications: "",
        department_id: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year_of_issue: 2022,
        commissioning_date: "",
      },
      equipmentEdit: {
        name: "",
        next: [],
        manufacturer: "",
        specifications: "",
        department_id: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year_of_issue: 2022,
        commissioning_date: "",
      },
      equipmentDetail: {},
      equipmentEditIndex: -1,
      equipmentEditDefault: {
        name: "",
        next: [],
        manufacturer: "",
        specifications: "",
        department_id: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year_of_issue: 2022,
        commissioning_date: "",
      },
      equipmentNewDefault: {
        name: "",
        from: 0,
        to: 1,
        manufacturer: "",
        specifications: "",
        department_id: "",
        factory_number: "",
        inventory_number: "",
        registration_number: "",
        operating_hours: "",
        year_of_issue: 2022,
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
    "equipmentNew.from": function (value) {
      if (value === this.data.length - 1) {
        this.equipmentNew.to = 1;
      }
    },
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
        this.loadEquipmentsFilter(value);
      }
    },
  },
  computed: {
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
      if (this.dialogAdd == true) {
        for (let i = 0; i < this.data.length; i++) {
          if (
            this.data[i].name !== "Start" &&
            this.data[i].name !== "End" &&
            i > this.equipmentNew.from
          ) {
            list.push({ name: this.data[i].name, value: i });
          }
        }
        list.push({ name: this.data[1].name, value: 1 });
        return list;
      } else if (this.dialogEdit == true) {
        for (let i = 0; i < this.data.length; i++) {
          if (
            this.data[i].name !== "Start" &&
            this.equipmentEdit.next.find((item) => item.index === i) ===
              undefined &&
            this.data[i].name !== this.equipmentEdit.name
          ) {
            list.push({ name: this.data[i].name, value: i });
          }
        }
        if (
          this.equipmentEdit.next.find((item) => item.index === 1) === undefined
        ) {
          list.push({ name: this.data[1].name, value: 1 });
        }
        return list;
      }
      return list;
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
    async load() {
      this.loadMaterials().then(() =>
        this.loadNodes().then(() =>
          this.loadEquipments().then(() => this.loadDepartments())
        )
      );
    },
    async loadEquipments() {
      this.loadingEquipment = true;
      await axios
        .get("http://127.0.0.1:8000/api/equipment/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.equipmentsAll = response.data;
          this.loadingEquipment = false;
        });
    },
    async loadNodes() {
      this.loadingNode = true;
      await axios
        .get("http://127.0.0.1:8000/api/node/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.nodesAll = response.data;
          this.loadingNode = false;
        });
    },
    async loadMaterials() {
      this.loadingMaterial = true;
      await axios
        .get("http://127.0.0.1:8000/api/material/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.materialsAll = response.data;
          this.loadingMaterial = false;
        });
    },
    openEditSubjects(item) {
      this.equipmentEditIndex = this.equipments.findIndex(
        (value) => value.name === item.name
      );
      this.equipmentEdit = Object.assign(
        {},
        this.equipments[this.equipmentEditIndex]
      );
      this.dialogSubjects = true;
    },
    closeEditSubjects() {
      this.dialogSubjects = false;
      this.loadEquipmentsFilter(this.departmentThird);
      this.$nextTick(() => {
        this.equipmentEditIndex = -1;
      });
    },
    initDiagram() {
      const $ = go.GraphObject.make;
      const diagram = $(go.Diagram, {
        "grid.visible": true,
        allowMove: false,
        "grid.gridCellSize": new go.Size(20, 20),
        "draggingTool.isGridSnapEnabled": true,
        "resizingTool.isGridSnapEnabled": true,
        "rotatingTool.snapAngleMultiple": 90,
        "rotatingTool.snapAngleEpsilon": 45,
        "undoManager.isEnabled": true,
        model: $(go.GraphLinksModel, {
          linkKeyProperty: "key",
        }),
      });
      diagram.nodeTemplateMap.add(
        "Process",
        $(
          go.Node,
          "Auto",
          {
            locationSpot: new go.Spot(0.5, 0.5),
            locationObjectName: "SHAPE",
            resizable: true,
            resizeObjectName: "SHAPE",
          },
          new go.Binding("location", "pos", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(
            go.Shape,
            "Circle",
            {
              name: "SHAPE",
              strokeWidth: 2,
              fill: $(go.Brush, "Linear", {
                start: go.Spot.Left,
                end: go.Spot.Right,
                0: "gray",
                0.5: "white",
                1: "gray",
              }),
              minSize: new go.Size(50, 50),
              portId: "",
              fromSpot: go.Spot.AllSides,
              toSpot: go.Spot.AllSides,
            },
            new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(
              go.Size.stringify
            )
          ),
          $(
            go.TextBlock,
            {
              alignment: go.Spot.Center,
              textAlign: "center",
              margin: 5,
              editable: true,
            },
            new go.Binding("text").makeTwoWay()
          )
        )
      );

      diagram.nodeTemplateMap.add(
        "Valve",
        $(
          go.Node,
          "Vertical",
          {
            locationSpot: new go.Spot(0.5, 1, 0, -21),
            locationObjectName: "SHAPE",
            selectionObjectName: "SHAPE",
            rotatable: true,
          },
          new go.Binding("angle").makeTwoWay(),
          new go.Binding("location", "pos", go.Point.parse).makeTwoWay(
            go.Point.stringify
          ),
          $(
            go.TextBlock,
            {
              alignment: go.Spot.Center,
              textAlign: "center",
              margin: 5,
              editable: true,
            },
            new go.Binding("text").makeTwoWay(),
            // keep the text upright, even when the whole node has been rotated upside down
            new go.Binding("angle", "angle", (a) =>
              a === 180 ? 180 : 0
            ).ofObject()
          ),
          $(go.Shape, {
            name: "SHAPE",
            geometryString:
              "F1 M0 0 L40 20 40 0 0 20z M20 10 L20 30 M12 30 L28 30",
            strokeWidth: 2,
            fill: $(go.Brush, "Linear", {
              0: "gray",
              0.35: "white",
              0.7: "gray",
            }),
            portId: "",
            fromSpot: new go.Spot(1, 0.35),
            toSpot: new go.Spot(0, 0.35),
          })
        )
      );

      diagram.linkTemplate = $(
        go.Link,
        {
          routing: go.Link.AvoidsNodes,
          curve: go.Link.JumpGap,
          corner: 10,
          reshapable: true,
          toShortLength: 7,
        },
        new go.Binding("points").makeTwoWay(),
        // mark each Shape to get the link geometry with isPanelMain: true
        $(go.Shape, { isPanelMain: true, stroke: "black", strokeWidth: 7 }),
        $(go.Shape, { isPanelMain: true, stroke: "gray", strokeWidth: 5 }),
        $(go.Shape, {
          isPanelMain: true,
          stroke: "white",
          strokeWidth: 3,
          name: "PIPE",
          strokeDashArray: [10, 10],
        }),
        $(go.Shape, {
          toArrow: "Triangle",
          scale: 1.3,
          fill: "gray",
          stroke: null,
        })
      );

      var animation = new go.Animation();
      animation.easing = go.Animation.EaseLinear;
      diagram.links.each((link) =>
        animation.add(link.findObject("PIPE"), "strokeDashOffset", 20, 0)
      );
      // Run indefinitely
      animation.runCount = Infinity;
      animation.start();
      return diagram;
    },
    closeDetailEquipment() {
      this.dialogDetail = false;
      this.$nextTick(() => {
        this.equipmentDetail = {};
      });
    },
    openEditEquipment(value) {
      this.equipmentEditIndex = this.equipments.findIndex(
        (item) => item.name === value.name
      );
      this.equipmentEdit = Object.assign(
        {},
        this.equipments[this.equipmentEditIndex]
      );
      let dataIndex = this.data.findIndex((item) => item.name === value.name);
      this.equipmentEdit.next = this.data[dataIndex].next;
      this.equipmentEdit.department_id = parseInt(
        this.equipmentEdit.department_id
      );
      this.linkTable();
      this.dialogEdit = true;
    },
    openDetailEquipment(value) {
      this.equipmentDetail = this.equipments.find(
        (item) => item.name === value.name
      );
      this.dialogDetail = true;
    },
    openEditDetailEquipment(node) {
      if (this.editFlag) {
        this.equipmentEditIndex = this.equipments.findIndex(
          (item) => item.name === node.name
        );
        this.equipmentEdit = Object.assign(
          {},
          this.equipments[this.equipmentEditIndex]
        );
        let dataIndex = this.data.findIndex((item) => item.name === node.name);
        this.equipmentEdit.next = this.data[dataIndex].next;
        this.equipmentEdit.department_id = parseInt(
          this.equipmentEdit.department_id
        );
        this.linkTable();
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
    async loadEquipmentsFilter(id) {
      await axios
        .get("http://127.0.0.1:8000/api/equipment/filter/" + id + "/", {
          headers: { Accept: "application/json" },
          timeout: 1000 * 5,
        })
        .then((response) => {
          this.equipments = response.data;
          this.equipmentNew.department_id = id;
          this.equipmentNewDefault.department_id = id;
          this.equipmentEdit.department_id = id;
          this.equipmentEditDefault.department_id = id;
        });
    },
    //-------------------------------------------------------------
    openDeleteEquipment(item) {
      this.equipmentEditIndex = this.equipments.indexOf(item);
      this.equipmentEdit = Object.assign({}, item);
      this.dialogDelete = true;
    },
    async addEquipment() {
      try {
        this.data.push({
          id: this.data.length - 1,
          name: this.equipmentNew.name,
          status: "success",
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
        let department = this.departments.find(
          (item) => item.id == this.equipmentNew.department_id
        );
        department.diagram = JSON.stringify(this.data);
        department.diagram = department.diagram.replace(/\\/g, "");
        await axios
          .post("http://127.0.0.1:8000/api/equipment/", this.equipmentNew, {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          })
          .then(() => {
            axios
              .put(
                "http://127.0.0.1:8000/api/department/" +
                  this.equipmentNew.department_id,
                department,
                {
                  headers: { Accept: "application/json" },
                  timeout: 1000 * 5,
                }
              )
              .then(() => {
                this.$notify({
                  title: "Уведомление",
                  type: "success",
                  text: "Добавлено новое оборудование!",
                });
              });
          });
        this.closeAddEquipment();
      } catch (e) {
        this.$notify({
          title: "Уведомление",
          type: "error",
          text: "Ошибка!",
        });
        this.closeAddEquipment();
      }
    },
    closeAddEquipment() {
      this.dialogAdd = false;
      this.loadDepartments();
      this.loadEquipmentsFilter(this.departmentThird);
      this.$refs["pipeline"].render();
      this.$nextTick(() => {
        this.equipmentNew = Object.assign({}, this.equipmentNewDefault);
      });
    },
    async editEquipment() {
      try {
        let dataIndex = this.data.findIndex(
          (item) => item.name === this.equipments[this.equipmentEditIndex].name
        );
        Object.assign(
          this.equipments[this.equipmentEditIndex],
          this.equipmentEdit
        );

        this.data[dataIndex].name = this.equipmentEdit.name;
        this.data[dataIndex].next = this.equipmentEdit.next;

        let department = this.departments.find(
          (item) => item.id == this.equipmentEdit.department_id
        );
        department.diagram = JSON.stringify(this.data);
        department.diagram = department.diagram.replace(/\\/g, "");
        await axios
          .put(
            "http://127.0.0.1:8000/api/equipment/" +
              this.equipmentEdit.id +
              "/",
            this.equipmentEdit,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              timeout: 1000 * 5,
            }
          )
          .then(() => {
            axios
              .put(
                "http://127.0.0.1:8000/api/department/" +
                  this.equipmentEdit.department_id +
                  "/",
                department,
                {
                  headers: { Accept: "application/json" },
                  timeout: 1000 * 5,
                }
              )
              .then(() => {
                this.$notify({
                  title: "Уведомление",
                  type: "success",
                  text: "Оборудование отредактировано!",
                });
              });
          });

        this.closeEditEquipment();
      } catch (e) {
        this.$notify({
          title: "Уведомление",
          type: "error",
          text: "Ошибка!",
        });
        this.closeEditEquipment();
      }
    },
    closeEditEquipment() {
      this.dialogEdit = false;
      this.loadDepartments();
      this.loadEquipmentsFilter(this.departmentThird);
      this.$refs["pipeline"].render();
      this.$nextTick(() => {
        this.equipmentEdit = Object.assign({}, this.equipmentEditDefault);
        this.equipmentEditIndex = -1;
      });
    },
    async deleteEquipment() {
      try {
        let dataIndex = this.data.findIndex(
          (item) => item.name === this.equipments[this.equipmentEditIndex].name
        );
        for (let i = 0; i < this.data.length; i++) {
          let itemIndex = this.data[i].next.findIndex(
            (item) => item.index === dataIndex
          );

          if (itemIndex !== -1) {
            this.data[i].next.splice(itemIndex, 1);

            this.data[i].next.push(...this.data[dataIndex].next);
          }
        }
        this.data.splice(dataIndex, 1);
        let department = this.departments.find(
          (item) => item.id == this.equipmentEdit.department_id
        );
        department.diagram = JSON.stringify(this.data);
        department.diagram = department.diagram.replace(/\\/g, "");
        await axios
          .delete(
            "http://127.0.0.1:8000/api/equipment/" +
              this.equipmentEdit.id +
              "/",
            { headers: { Accept: "application/json" } }
          )
          .then(() => {
            axios.put(
              "http://127.0.0.1:8000/api/department/" +
                this.equipmentEdit.department_id +
                "/",
              department,
              {
                headers: { Accept: "application/json" },
                timeout: 1000 * 5,
              }
            );
          });
        this.closeDeleteEquipment();
      } catch (e) {
        this.$notify({
          title: "Уведомление",
          type: "error",
          text: "Ошибка!",
        });
        this.closeDeleteEquipment();
      }
    },
    closeDeleteEquipment() {
      this.dialogDelete = false;
      this.loadDepartments();
      this.loadEquipmentsFilter(this.departmentThird);
      this.$refs["pipeline"].render();
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
      this.linkTable();
      this.$nextTick(() => {
        this.linkAdd = null;
      });
    },
    async deleteLink(item) {
      this.equipmentEdit.next.splice(item.index, 1);
      this.linkTable();
    },
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
      this.links = data;
    },
    reload() {
      this.loadDepartments();
      this.loadEquipmentsFilter(this.departmentThird);
      this.$notify({
        title: "Уведомление",
        type: "success",
        text: "Обновление",
      });
    },
  },
  mounted() {
    this.load();
  },
};
</script>

<style>
.vue-diagram {
  position: relative;
  width: 100%;
  height: 600px !important;
}

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
