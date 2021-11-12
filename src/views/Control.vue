<template>
  <div v-if="lineData">
    <v-card>
      <v-card-text>
        <v-card-title
          >Линия №{{ lineData.line_id }} --- Участок №{{ lineData.plot_id }} ---
          Цех №{{ lineData.dep_id }}</v-card-title
        >
        <status
          :status="lineData.status"
          :statusPvFirst="lineData.statusPvFirst"
          :statusSpFirst="lineData.statusSpFirst"
          :statusPvSecond="lineData.statusPvSecond"
          :statusSpSecond="lineData.statusSpSecond"
          :accident="lineData.accidentStatus"
        />
        <v-btn rounded depressed color="indigo" dark @click="$router.push('/')"
          ><v-icon dark> mdi-chevron-left </v-icon>Назад</v-btn
        >
      </v-card-text>
      <v-card-text>
        <v-divider></v-divider>
        <v-row
          ><v-col
            cols="12"
            md="5"
            sm="12"
            xs="12"
            v-if="(loadUser.rights & 2) == 2"
          >
            <div>
              <v-card class="mt-4"
                ><v-card-text>
                  <v-row
                    ><v-col cols="12" sm="6"
                      ><v-switch
                        class="my-3"
                        label="Наладка"
                        color="warning"
                        v-model="maintainance"
                        :false-value="false"
                        :true-value="true"
                        hide-details
                      ></v-switch
                    ></v-col>
                    <v-col cols="12" sm="6"
                      ><v-switch
                        class="my-3"
                        label="Добавить акциз"
                        color="primary"
                        v-model="taxAdd"
                        :false-value="false"
                        :true-value="true"
                        hide-details
                      ></v-switch></v-col
                  ></v-row>
                  <div v-if="!maintainance">
                    <v-select
                      v-model="gid_id"
                      :items="taskSelect"
                      item-text="product"
                      item-value="id"
                      :label="taskSelectionMessage"
                      filled
                      required
                      v-if="taskSelect && !taxAdd"
                    >
                    </v-select>
                    <v-data-table
                      :headers="headers"
                      :items="values"
                      hide-default-footer
                      class="elevation-1 mb-3"
                      v-if="!exportParameter || taxAdd"
                    >
                      <template v-slot:top>
                        <v-toolbar flat>
                          <v-toolbar-title>Акцизные марки</v-toolbar-title>
                          <v-divider class="mx-4" inset vertical></v-divider>
                          <v-spacer></v-spacer>
                          <v-dialog v-model="dialogAdd" max-width="650px">
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                color="primary"
                                dark
                                class="mb-2"
                                v-bind="attrs"
                                v-on="on"
                              >
                                Новое значение
                              </v-btn>
                            </template>
                            <v-card>
                              <v-card-title>
                                <span class="text-h5">{{ formTitle }}</span>
                              </v-card-title>
                              <v-form
                                ref="form"
                                lazy-validation
                                v-model="validate"
                              >
                                <v-card-text>
                                  <v-container>
                                    <v-row>
                                      <v-col cols="12" sm="6" md="4">
                                        <v-select
                                          v-model="editedItem.letter"
                                          :items="itemsLetters"
                                          label="Буква серии АМ"
                                          :rules="ruleLetter"
                                          data-vv-name="Буква серии АМ"
                                        ></v-select>
                                      </v-col>
                                      <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                          v-model="editedItem.series_start"
                                          label="Начало серии"
                                          :rules="ruleSeriesStart"
                                          :counter="3"
                                        ></v-text-field>
                                      </v-col>
                                      <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                          v-model="editedItem.series_end"
                                          label="Конец серии"
                                          :rules="ruleSeriesEnd"
                                          :counter="3"
                                        ></v-text-field>
                                      </v-col>
                                      <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                          v-model="editedItem.number_start"
                                          label="Начальный номер"
                                          :rules="ruleNumberStart"
                                          :counter="9"
                                        ></v-text-field>
                                      </v-col>
                                      <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                          v-model="editedItem.number_end"
                                          label="Конечный номер"
                                          :rules="ruleNumberEnd"
                                          :counter="9"
                                        ></v-text-field>
                                      </v-col>
                                    </v-row>
                                  </v-container>
                                </v-card-text>

                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="closeAdd"
                                  >
                                    Закрыть
                                  </v-btn>
                                  <v-btn
                                    color="primary"
                                    :disabled="!validate"
                                    @click="save"
                                  >
                                    Сохранить
                                  </v-btn>
                                </v-card-actions></v-form
                              >
                            </v-card>
                          </v-dialog>
                          <v-dialog v-model="dialogDelete" max-width="500px">
                            <v-card>
                              <v-card-title class="text-h5"
                                >Подтверждение удаления</v-card-title
                              >
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="blue darken-1"
                                  text
                                  @click="closeDelete"
                                  >Отмена</v-btn
                                >
                                <v-btn
                                  color="blue darken-1"
                                  dark
                                  @click="deleteItemConfirm"
                                  >Подтвердить</v-btn
                                >
                                <v-spacer></v-spacer>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-toolbar>
                      </template>
                      <template v-slot:[`item.actions`]="{ item }">
                        <v-icon small class="mr-2" @click="editItem(item)">
                          mdi-pencil
                        </v-icon>
                        <v-icon small @click="deleteItem(item)">
                          mdi-delete
                        </v-icon>
                      </template>
                      <template v-slot:no-data>
                        <p>Нет доступных значений</p>
                      </template>
                    </v-data-table>
                    <p align="right" v-if="!exportParameter || taxAdd">
                      Итого номеров: {{ taxSum }}
                    </p>
                    <v-select
                      v-model="taxType"
                      :items="lineData.txc_variants"
                      item-text="value"
                      item-value="key"
                      label="Вид акцизной марки"
                      data-vv-name="Вид акцизной марки"
                      v-if="!exportParameter && !taxAdd"
                    ></v-select>
                    <v-text-field
                      class="mb-2"
                      v-model="tax"
                      label="Ввод суммы номеров акцизных марок"
                      :rules="rules"
                      :counter="5"
                      v-if="exportParameter && !taxAdd"
                    ></v-text-field>
                  </div>
                  <div v-else>
                    <v-row class="mb-2">
                      <v-col cols="12" sm="6" md="4">
                        <v-select
                          v-model="vlc"
                          :items="lineData.vlc_variants"
                          item-text="key"
                          item-value="value"
                          label="Объём"
                          data-vv-name="Объём"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-select
                          v-model="pdc"
                          :items="lineData.pdc_variants"
                          item-text="key"
                          item-value="value"
                          label="Продукция"
                          data-vv-name="Продукция"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-select
                          v-model="pkc"
                          :items="lineData.pkc_variants"
                          item-text="key"
                          item-value="value"
                          label="Тара"
                          data-vv-name="Тара"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </div>
                  <v-btn
                    block
                    elevation="10"
                    color="success"
                    x-large
                    v-if="!taxAdd"
                    @click.stop="securityCheck(1)"
                    :disabled="
                      maintainance
                        ? vlc === null || pdc === null || pkc === null
                          ? true
                          : false
                        : exportParameter
                        ? gid === null || tax === null || tax === ''
                          ? true
                          : false
                        : gid === null ||
                          values.length === 0 ||
                          taxType === null
                        ? true
                        : false
                    "
                    >Добавить задание</v-btn
                  ><v-btn
                    block
                    elevation="10"
                    color="primary"
                    x-large
                    v-else
                    @click.stop="securityCheck(2)"
                    :disabled="values.length === 0 ? true : false"
                    >Добавить акциз</v-btn
                  >
                </v-card-text>
              </v-card>
            </div>

            <v-btn
              block
              elevation="10"
              class="my-5"
              color="success"
              x-large
              @click.stop="securityCheck(3)"
              :disabled="lineData.status === -1"
              >Старт линии</v-btn
            >
            <v-btn
              block
              elevation="10"
              color="error"
              class="my-5"
              x-large
              @click.stop="securityCheck(4)"
              >Остановка линии</v-btn
            >
            <v-btn
              block
              elevation="2"
              class="my-5"
              large
              @click.stop="securityCheck(5)"
            >
              Сброс данных
            </v-btn>
            <v-btn block elevation="2" class="my-5" large disabled>
              Выгрузка данных
            </v-btn>
            <v-dialog v-model="dialogLogin" max-width="500" persistent>
              <v-card>
                <v-card-title class="text-h5">
                  Требуется авторизация
                </v-card-title>

                <v-form
                  ref="form_auth"
                  lazy-validation
                  v-model="form.validate"
                  @submit.prevent="submit"
                  v-on:keyup.enter="submit"
                >
                  <v-card-text>
                    <v-text-field
                      prepend-icon="mdi-account"
                      name="username"
                      label="Логин"
                      type="text"
                      :rules="form.usernameRules"
                      v-model="form.username"
                    ></v-text-field>
                    <v-text-field
                      id="password"
                      prepend-icon="mdi-lock"
                      name="password"
                      label="Пароль"
                      type="password"
                      :rules="form.passwordRules"
                      v-model="form.password"
                    ></v-text-field>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn type="submit" color="primary darken-1" dark>
                      Ввод
                    </v-btn>
                    <v-btn
                      color="green darken-1"
                      text
                      @click="dialogLogin = false"
                    >
                      Отмена
                    </v-btn>
                  </v-card-actions></v-form
                >
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="12" sm="12" md="7" xs="12" order-md="first">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6" sm="12" xs="12">
                  <p v-if="lineData.timetable">
                    Количество заданий: {{ lineData.timetable.length }}
                  </p>
                  <p v-else>Нет заданий</p>
                  <p>
                    Количество бутылок в текущем задании: А ---
                    {{ lineData.statusPvFirst }} Р ---
                    {{ lineData.statusPvSecond }}
                  </p>
                  <p>
                    Насчитано без марок: А --- {{lineData.statusPv0First}} Р --- {{lineData.statusPv0Second}}
                  </p>
                  <p>
                    Насчитано без задания: А --- {{lineData.statusPv1First}} Р --- {{lineData.statusPv1Second}}
                  </p>
                </v-col>
                <v-col cols="12" md="6" sm="12" xs="12" class="text-right">
                  <v-dialog
                    v-model="dialogInfo"
                    fullscreen
                    hide-overlay
                    transition="dialog-bottom-transition"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="red lighten-2"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      >
                        Информация с счетчиков
                      </v-btn>
                    </template>

                    <v-card>
                      <v-toolbar dark color="primary">
                        <v-btn icon dark @click="dialogInfo = false">
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title
                          >Информация с счетчиков</v-toolbar-title
                        >
                      </v-toolbar>
                      <v-card-text>
                        <div v-if="lineData.info">
                          <v-subheader>
                            Счетчик {{ lineData.info[0].bid }}, акцизный
                          </v-subheader>
                          <v-simple-table dense v-if="lineData.info[0].info">
                            <template v-slot:default>
                              <thead>
                                <tr>
                                  <th class="text-left">Название параметра</th>
                                  <th class="text-left">Значение</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Продукция</td>
                                  <td>{{ lineData.info[0].info.pdc }}</td>
                                </tr>
                                <tr>
                                  <td>Тара (код)</td>
                                  <td>{{ lineData.info[0].info.pkc }}</td>
                                </tr>
                                <tr>
                                  <td>Акциз</td>
                                  <td>{{ lineData.info[0].info.tax }}</td>
                                </tr>
                                <tr>
                                  <td>Объем (код)</td>
                                  <td>{{ lineData.info[0].info.vlc }}</td>
                                </tr>
                              </tbody>
                            </template>
                          </v-simple-table>
                          <p v-else>Нет данных</p>
                          <v-subheader>
                            Счетчик {{ lineData.info[1].bid }}, разливной
                          </v-subheader>
                          <v-simple-table dense v-if="lineData.info[1].info">
                            <template v-slot:default>
                              <thead>
                                <tr>
                                  <th class="text-left">Название параметра</th>
                                  <th class="text-left">Значение</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td>Продукция</td>
                                  <td>{{ lineData.info[1].info.pdc }}</td>
                                </tr>
                                <tr>
                                  <td>Тара (код)</td>
                                  <td>{{ lineData.info[1].info.pkc }}</td>
                                </tr>
                                <tr>
                                  <td>Акциз</td>
                                  <td>{{ lineData.info[1].info.tax }}</td>
                                </tr>
                                <tr>
                                  <td>Объем (код)</td>
                                  <td>{{ lineData.info[1].info.vlc }}</td>
                                </tr>
                              </tbody>
                            </template>
                          </v-simple-table>
                          <p v-else>Нет данных</p>
                        </div>
                        <p v-else>Нет данных со счетчиков</p>
                        <v-divider class="my-9"></v-divider>
                        <v-divider class="my-9"></v-divider>
                        <v-subheader> Счетчик акцизный </v-subheader>
                        <v-simple-table v-if="lineData.hw_events_1">
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">Тип</th>
                                <th class="text-left">Описание события</th>
                                <th class="text-left">Дата</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="item in lineData.hw_events_1"
                                :key="item.name"
                              >
                                <td>{{ item.type }}</td>
                                <td>
                                  <pre>{{ item.description }}</pre>
                                </td>
                                <td>{{ item.date }}</td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                        <p v-else>Нет данных</p>
                        <v-subheader> Счетчик разливной </v-subheader>
                        <v-simple-table v-if="lineData.hw_events_2">
                          <template v-slot:default>
                            <thead>
                              <tr>
                                <th class="text-left">Тип</th>
                                <th class="text-left">Описание события</th>
                                <th class="text-left">Дата</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="item in lineData.hw_events_2"
                                :key="item.name"
                              >
                                <td>{{ item.type }}</td>
                                <td>
                                  <pre>{{ item.description }}</pre>
                                </td>
                                <td>{{ item.date }}</td>
                              </tr>
                            </tbody>
                          </template>
                        </v-simple-table>
                        <p v-else>Нет данных</p>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <v-btn
                    class="ml-4"
                    color="green lighten-2"
                    dark
                    href="http://attp:5000/loglog"
                    target="_blank"
                  >
                    ЛОГ
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-container>
              <v-btn
                @click="downloadData"
                icon
                elevation="2"
                class="mb-2"
                outlined
                color="green"
                ><v-icon>mdi-update</v-icon></v-btn
              >
              <v-sheet color="white" height="340"
                ><vue-plotly
                  :id="lineData.key"
                  :refers="lineData.key"
                  :data="series"
                  :options="options"
                  :layout="lineData.layout"
                  :display-mode-bar="false"
                  :autoResize="true"
                />
              </v-sheet>
            </v-container>
            <v-divider></v-divider>
            <accidents class="my-2" :line_key="lineData.key" />
            <v-divider></v-divider>
            <v-card-text v-if="lineData.timetable">
              <v-card
                class="mb-3"
                elevation="2"
                v-for="(task, index) in lineData.timetable"
                :key="task.id"
              >
                <v-card-text>
                  <div class="overline mb-4">Задание №{{ index + 1 }}</div>
                  <v-simple-table height="300px">
                    <template v-slot:default>
                      <thead>
                        <tr>
                          <th class="text-left">Название параметра</th>
                          <th class="text-left">Значение</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Время</td>
                          <td>{{ task.pstart }} - {{ task.pfinish }}</td>
                        </tr>
                        <tr>
                          <td>Название</td>
                          <td>{{ task.product }}</td>
                        </tr>
                        <tr>
                          <td>Объем</td>
                          <td>{{ task.vol }}</td>
                        </tr>
                        <tr>
                          <td>Упаковка</td>
                          <td>{{ task.packing }}</td>
                        </tr>
                        <tr>
                          <td>Количество</td>
                          <td>{{ task.cnt }}</td>
                        </tr>
                      </tbody>
                    </template>
                  </v-simple-table>
                  <p>Цифровой код(ID): {{ task.gid }}</p>
                </v-card-text>
              </v-card>
            </v-card-text></v-col
          >
        </v-row>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import FormData from "form-data";
import Status from "../components/Status.vue";
import Accidents from "../components/Accidents.vue";
import { TokenValidation } from "../plugins/utils.js";
import VuePlotly from "@statnett/vue-plotly";

export default {
  name: "Control",
  components: { Status, Accidents, VuePlotly },
  data() {
    return {
      chartTimeout: null,
      form: {
        validate: false,
        username: "",
        password: "",
        usernameRules: [(value) => !!value || "Введите значение."],
        passwordRules: [(value) => !!value || "Введите значение."],
      },
      task: null,
      dialogLogin: false,
      dialogInfo: false,
      taxAdd: false,
      vlc: null,
      pdc: null,
      pkc: null,
      taxType: null,
      dialogAdd: false,
      dialogDelete: false,
      editedItem: {
        letter: "",
        series_start: "",
        series_end: "",
        number_start: "",
        number_end: "",
        result: 0,
      },
      editedIndex: -1,
      defaultItem: {
        letter: "",
        series_start: "",
        series_end: "",
        number_start: "",
        number_end: "",
        result: 0,
      },
      itemsLetters: ["А", "Б", "В", "Д", "И", "Л", "М", "Х", "Ц", "Я"],
      headers: [
        { text: "Буква серии АМ", align: "start", value: "letter" },
        { text: "Нач.серии", value: "series_start" },
        { text: "Кон.серии", value: "series_end" },
        { text: "Начальный номер", value: "number_start" },
        { text: "Конечный номер", value: "number_end" },
        { text: "Итого номеров", value: "result" },
        { text: "Действия", value: "actions", sortable: false },
      ],
      values: [],
      series: [
        {
          x: [],
          y: [],
          type: "scatter",
          line: { color: "#17BECF", shape: "hv" },
          mode: "lines",
          name: "Акцизный счетчик",
        },
        {
          x: [],
          y: [],
          type: "scatter",
          line: { color: "#7F7F7F", shape: "hv" },
          mode: "lines",
          name: "Разливной счетчик",
        },
      ],
      options: {
        doubleClick: "reset",
        responsive: true,
        displaylogo: false,
        displayModeBar: true,
        modeBarButtonsToRemove: [
          "toggleSpikelines",
          "toImage",
          "pan2d",
          "select2d",
          "lasso2d",
          "resetScale2d",
          "autoScale2d",
        ],
      },
      validate: false,
      maintainance: false,
      exportParameter: false,
      gid: null,
      gid_id: -1,
      tax_export_default: 0,
      tax: null,
      rules:[(value) => !!value || "Введите значение.",(value) => !isNaN(value) || "Требуется ввод цифрового значения.",(value) => value[0] !== "0" || "Первый символ не должен быть нулем.",],
      ruleSeriesStart: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
        (value) => value[0] !== "0" || "Первый символ не должен быть нулем.",
        (value) => value.length <= 3 || "Превышено количество символов.",
      ],
      ruleSeriesEnd: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
        (value) => value[0] !== "0" || "Первый символ не должен быть нулем.",
        (value) => value.length <= 3 || "Превышено количество символов.",
        (value) =>
          parseInt(value) >= parseInt(this.editedItem.series_start) ||
          "Значение конца серии меньше старта.",
      ],
      ruleNumberStart: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
        (value) => value[0] !== "0" || "Первый символ не должен быть нулем.",
        (value) => value.length <= 9 || "Превышено количество символов.",
      ],
      ruleNumberEnd: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
        (value) => value[0] !== "0" || "Первый символ не должен быть нулем.",
        (value) => value.length <= 9 || "Превышено количество символов.",
        (value) =>
          parseInt(value) >= parseInt(this.editedItem.number_start) ||
          "Значение конца номера меньше старта.",
      ],
      ruleLetter: [(value) => !!value || "Введите значение"],
      buttonAdd: true,
    };
  },
  computed: {
    loadUser() {
      return this.$store.getters.LOAD_USER;
    },
    taxSum() {
      let result = 0;
      for (let i = 0; i < this.values.length; i++) {
        result += this.values[i].result;
      }
      return result;
    },
    formTitle() {
      return this.editedIndex === -1
        ? "Новое значение"
        : "Редактировать значение";
    },
    lineData() {
      let key = this.$route.params.key;
      let lines = this.$store.getters.LOAD_LINES;
      if (lines) {
        for (let i = 0; i < lines.length; i++)
          if (lines[i].key === key) {
            return lines[i];
          }
        return lines;
      } else return null;
    },
    taskSelectionMessage() {
      if (this.lineData.timetable) {
        return "Выберите задание";
      } else {
        return "Выберите из доступной продукции";
      }
    },
    taskSelect() {
      let lines = this.lineData;
      var timetable = [];
      if (lines.timetable) {
        for (let i = 0; i < lines.timetable.length; i++) {
          timetable.push({
            id: i,
            product:
              lines.timetable[i].export === 0
                ? lines.timetable[i].product +
                  " --- " +
                  lines.timetable[i].packing + " --- " + lines.timetable[i].cnt
                : lines.timetable[i].product +
                  " --- " +
                  lines.timetable[i].packing +
                  " --- " + 
                  "ЭКСПОРТ" + " --- " + lines.timetable[i].cnt,
            gid: lines.timetable[i].gid,
            cnt: lines.timetable[i].cnt
          });
        }
        return timetable;
      } else if (lines.product) {
        for (let i = 0; i < Object.keys(lines.product).length; i++) {
          timetable.push({
            product: Object.keys(lines.product)[i],
            gid: 0,
          });
        }
        return timetable;
      }
      return null;
    },
  },
  watch: {
    "editedItem.series_start": function (value) {
      if (this.editedIndex === -1) {
        this.editedItem.series_end = value;
      }
    },
    "editedItem.number_start": function (value) {
      if (this.editedIndex === -1) {
        this.editedItem.number_end = value;
      }
    },
    taxAdd: function (value) {
      if (value === true) {
        this.maintainance = false;
      }
    },
    maintainance: function (value) {
      if (value === true) {
        this.taxAdd = false;
      }
    },
    dialogAdd: function (value) {
      value || this.closeAdd();
    },
    dialogDelete: function (value) {
      value || this.closeDelete();
    },
    gid_id: function (value) {
      this.gid = this.taskSelect[value].gid;
      this.changeExport(this.gid);
      if (this.exportParameter){
        this.tax = this.taskSelect[value].cnt;
      }
    },
    username: function () {
      this.validateFieldAuth();
    },
    password: function () {
      this.validateFieldAuth();
    },
  },
  methods: {
    async sendCommand(form, success, error, journal) {
      await axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 1000 * 5,
        })
        .then(() => {
          axios.post(
            "http://auth.vmvisioprom.kristal.local/api/log/",
            journal,
            { header: { "Content-type": "application/json" } }
          );
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: success,
          });
        })
        .catch(() => {
          journal.description = journal.description + " ERROR";
          axios.post(
            "http://auth.vmvisioprom.kristal.local/api/log/",
            journal,
            { header: { "Content-type": "application/json" } }
          );
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: error,
          });
        });
    },
    validateFieldAuth() {
      this.$refs.form_auth.validate();
    },
    async submit() {
      this.validateFieldAuth();
      await this.$store
        .dispatch("LOGIN", {
          username: this.form.username,
          password: this.form.password,
        })
        .then(() => {
          this.form.username = "";
          this.form.password = "";
          this.securityCheck(this.task);
        });
    },
    loginCheck() {
      if (!TokenValidation(this.$store.getters.LOAD_TOKEN)) {
        this.dialogLogin = true;
        return false;
      } else {
        this.dialogLogin = false;
        return true;
      }
    },
    async securityCheck(task) {
      this.task = task;
      if (this.loginCheck()) {
        await axios
          .get(
            "http://auth.vmvisioprom.kristal.local/api/security/security_check/",
            {
              headers: {
                Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
              },
            }
          )
          .then(() => {
            var form = new FormData();
            switch (this.task) {
              case 1:
                form.append("redkey", this.$route.params.key);
                form.append("req_action", "set_data");
                form.append("gid", this.maintainance ? 0 : this.gid);
                form.append("vlc", this.vlc);
                form.append("pdc", this.pdc);
                form.append("pkc", this.pkc);
                form.append(
                  "cnt",
                  this.exportParameter ? this.tax : this.taxSum
                );
                form.append("txc", this.taxType);
                form.append("tax", JSON.stringify(this.transformTax()));
                this.sendCommand(
                  form,
                  "Задание отправлено на счетчики.",
                  "Ошибка ввода задания. Повторите ввод!",
                  {
                    user: this.loadUser.name,
                    description:
                      this.$route.params.key +
                      " set_data, gid: " +
                      this.gid +
                      " tax: " +
                      JSON.stringify(this.transformTax()),
                  }
                );
                break;
              case 2:
                form.append("redkey", this.$route.params.key);
                form.append("req_action", "alter_tax");
                form.append("tax", JSON.stringify(this.transformTax()));
                form.append("cnt", this.taxSum);
                this.sendCommand(
                  form,
                  "Отправлено обновление акцизных марок.",
                  "Ошибка ввода акцизных марок. Повторите ввод!",
                  {
                    user: this.loadUser.name,
                    description:
                      this.$route.params.key +
                      " alter_tax tax: " +
                      JSON.stringify(this.transformTax()) +
                      " " +
                      this.taxSum,
                  }
                );
                break;
              case 3:
                form.append("redkey", this.$route.params.key);
                form.append("req_action", "job_start");
                this.sendCommand(
                  form,
                  "Отправлена команда запуска линии.",
                  "Ошибка отправки команды запуска. Попробуйте снова!",
                  {
                    user: this.loadUser.name,
                    description: this.$route.params.key + " job_start",
                  }
                );
                break;
              case 4:
                form.append("redkey", this.$route.params.key);
                form.append("req_action", "job_stop");
                this.sendCommand(
                  form,
                  "Отправлена команда остановки линии.",
                  "Ошибка отправки команды остановки. Попробуйте снова!",
                  {
                    user: this.loadUser.name,
                    description: this.$route.params.key + " job_stop",
                  }
                );
                break;
              case 5:
                form.append("redkey", this.$route.params.key);
                form.append("req_action", "job_cancel");
                this.sendCommand(
                  form,
                  "Отправлена команда очистки задания.",
                  "Ошибка отправки команды очистки задания. Попробуйте снова!",
                  {
                    user: this.loadUser.name,
                    description: this.$route.params.key + " job_cancel",
                  }
                );
                break;
              default:
                this.$notify({
                  title: "Уведомление",
                  type: "error",
                  text: "Ошибка отправки команды. Попробуйте снова!",
                });
                console.log("error");
            }
          })
          .catch((error) => {
            axios.post(
              "http://auth.vmvisioprom.kristal.local/api/log/",
              {
                user: this.loadUser.name,
                description: "SECURITY ERROR WHILE SENDING COMMAND",
              },
              { header: { "Content-type": "application/json" } }
            );
            console.log(error);
            this.$notify({
              title: "Уведомление",
              type: "error",
              text: "Ошибка безопасности!",
            });
          });
      }
    },
    editItem(item) {
      this.editedIndex = this.values.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogAdd = true;
    },
    deleteItem(item) {
      this.editedIndex = this.values.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },
    closeAdd() {
      this.dialogAdd = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    deleteItemConfirm() {
      this.values.splice(this.editedIndex, 1);
      this.closeDelete();
    },
    save() {
      if (this.$refs.form.validate()) {
        this.editedItem.result =
          (this.editedItem.number_end - this.editedItem.number_start + 1) *
          (this.editedItem.series_end - this.editedItem.series_start + 1);
        if (this.editedIndex > -1) {
          Object.assign(this.values[this.editedIndex], this.editedItem);
        } else {
          this.values.push(this.editedItem);
        }
        this.$refs.form.resetValidation();
        this.closeAdd();
      }
    },
    changeExport: function (value) {
      if (this.lineData.timetable) {
        let timetable = this.lineData.timetable;
        for (let i = 0; i < timetable.length; i++) {
          if (timetable[i].gid == value) {
            if (timetable[i].export == 1) {
              this.exportParameter = true;
            } else if (timetable[i].export == 0) {
              this.exportParameter = false;
            }
            break;
          }
        }
      } else {
        this.exportParameter = false;
      }
    },
    transformTax: function () {
      let tax = [];
      for (let i = 0; i < this.values.length; i++) {
        tax.push([
          this.values[i].letter,
          this.values[i].series_start,
          this.values[i].series_end,
          this.values[i].number_start,
          this.values[i].number_end,
        ]);
      }
      return tax;
    },
    async downloadData() {
      await axios
        .get(
          "http://attp.kristal.local:5000/chart?c=" +
            this.$route.params.key.slice(0, 5) +
            "&a=24&nz=1",
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        )
        .then((response) => {
          let keys = Object.keys(response.data.lines);
          let plots = Object.values(response.data.lines);
          for (let i = 0; i < keys.length; i++) {
            if (this.$route.params.key === keys[i]) {
              if (plots[i].plot["1"]) {
                this.series[0].x = plots[i].plot["1"][0];
                this.series[0].y = plots[i].plot["1"][1];
              }
              if (plots[i].plot["2"]) {
                this.series[1].x = plots[i].plot["2"][0];
                this.series[1].y = plots[i].plot["2"][1];
              }
            }
          }
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка соединения!",
          });
        });
    },
  },
  mounted() {
    this.downloadData();
    this.chartTimeout = setInterval(() => {
      this.downloadData();
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.chartTimeout);
  },
};
</script>

<style>
.numpad input::-webkit-outer-spin-button,
.numpad input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.numpad input[type="number"] {
  -moz-appearance: textfield;
}
.chart {
  height: 340px;
}
</style>
