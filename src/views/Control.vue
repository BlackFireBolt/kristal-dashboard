<template>
  <v-card>
    <v-card-text>
      <v-card-title>Линия №{{ lineData.line_id }}</v-card-title>
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
        ><v-col cols="12" md="5" sm="12" xs="12">
          <div>
            <v-card class="mt-4"
              ><v-card-text>
                <v-form ref="form" lazy-validation v-model="validate">
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
                      v-model="gid"
                      :items="taskSelect"
                      item-text="product"
                      item-value="gid"
                      :label="taskSelectionMessage"
                      filled
                      required
                      v-if="taskSelect && !taxAdd"
                    >
                    </v-select>
                    <!--
                      <div class="headline pa-5">Ввод акцизной марки</div>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="tax_s"
                            :rules="rules"
                            required
                            label="Начальное значение"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            :rules="rules"
                            v-model="tax_f"
                            required
                            label="Конечное значение"
                          ></v-text-field>
                        </v-col>
                      </v-row>
                      <v-text-field
                        :rules="rules"
                        v-model="tax"
                        required
                        label="Серия"
                      ></v-text-field>
                    </div>-->
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
                          <v-dialog v-model="dialogAdd" max-width="500px">
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

                              <v-card-text>
                                <v-container>
                                  <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                      <v-select
                                        v-model="editedItem.letter"
                                        :items="itemsLetters"
                                        label="Буква серии АМ"
                                        data-vv-name="Буква серии АМ"
                                      ></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                      <v-text-field
                                        v-model="editedItem.series_start"
                                        label="Начало серии"
                                        :rules="rules"
                                        :counter="3"
                                      ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                      <v-text-field
                                        v-model="editedItem.series_end"
                                        label="Конец серии"
                                        :rules="rules"
                                        :counter="3"
                                      ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                      <v-text-field
                                        v-model="editedItem.number_start"
                                        label="Начальный номер"
                                        :rules="rules"
                                        :counter="8"
                                      ></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                      <v-text-field
                                        v-model="editedItem.number_end"
                                        label="Конечный номер"
                                        :rules="rules"
                                        :counter="8"
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
                                <v-btn color="blue darken-1" dark @click="save">
                                  Сохранить
                                </v-btn>
                              </v-card-actions>
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
                      :items="taxTypes"
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
                          :items="vlcVariants"
                          item-text="key"
                          item-value="value"
                          label="Объёма"
                          data-vv-name="Объёма"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-select
                          v-model="pdc"
                          :items="pdcVariants"
                          item-text="key"
                          item-value="value"
                          label="Продукция"
                          data-vv-name="Продукция"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-select
                          v-model="pkc"
                          :items="pkcVariants"
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
                    @click="sendTaskButton"
                    :disabled="
                      maintainance
                        ? vlc === null || pdc === null || pkc === null
                          ? true
                          : false
                        : exportParameter
                        ? gid === null || tax === null
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
                    @click="sendTaxButton"
                    :disabled="values.length === 0 ? true : false"
                    >Добавить акциз</v-btn
                  >
                </v-form>
              </v-card-text>
            </v-card>
          </div>

          <v-btn
            block
            elevation="10"
            class="my-5"
            color="success"
            x-large
            @click="startButton"
            :disabled="lineData.status === -1"
            >Старт линии</v-btn
          >
          <v-btn
            block
            elevation="10"
            color="error"
            class="my-5"
            x-large
            @click="stopButton"
            >Остановка линии</v-btn
          >
          <v-btn block elevation="2" class="my-5" large @click="dataEraseButton"
            >Сброс данных</v-btn
          >
          <v-btn block elevation="2" class="my-5" large disabled
            >Выгрузка данных</v-btn
          ></v-col
        >
        <v-col cols="12" sm="12" md="7" xs="12" order-md="first">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6" sm="12" xs="12">
            <p v-if="lineData.timetable">
              Количество заданий: {{ lineData.timetable.length }}
            </p>
            <p v-else>Нет заданий</p>
            <p>Количество бутылок в текущем задании: {{ lineData.statusPv }}</p>
            </v-col>
            <v-col cols="12" md="6" sm="12" xs="12">
              <v-dialog
      v-model="dialogInfo"
      width="500"
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
        <v-card-title class="text-h5 grey lighten-2">
          Информация с счетчиков
        </v-card-title>

        <v-card-text><div v-if="lineData.info">
              <div class="overline mb-4">Счетчик {{ lineData.info[0].bid }}, акцизный</div>
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
              <div class="overline mb-4">Счетчик {{ lineData.info[1].bid }}, разливной</div>
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
            <p v-else >Нет данных со счетчиков</p>
            <v-divider class="my-9"></v-divider>
            <div>{{lineData.hw_events}}</div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialogInfo = false"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
              
            </v-col>
            </v-row>
          </v-card-text>
          <v-divider></v-divider>
          <v-container>
            <vue-plotly
              :id="lineData.key"
              :refers="lineData.key"
              :data="series"
              :layout="lineData.layout"
              :display-mode-bar="false"
              :autoResize="true"
          /></v-container>
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
</template>

<script>
import axios from "axios";
import FormData from "form-data";
import Status from "../components/Status.vue";
import Accidents from "../components/Accidents.vue";
import VuePlotly from "@statnett/vue-plotly";

export default {
  name: "Control",
  components: { Status, Accidents, VuePlotly },
  data() {
    return {
      dialogInfo: false,
      taxAdd: false,
      vlc: null,
      pdc: null,
      pkc: null,
      taxType: null,
      taxTypes: [
        "552 ЛВ 16Х90",
        "501 ЛВ 16Х90",
        "507 ЛВ 16Х65",
        "572 КВ 16Х90 0,5",
        "502 ЛВ 16Х160",
        "511 КВ 16Х90",
        "Акц.м.16*65ЛВИ",
        "503 ЛВ 20Х160",
        "514 КВ 16Х65",
        "16*160 1 и более",
        "504 ЛВ 16Х90",
      ],
      dialogAdd: false,
      dialogDelete: false,
      editedItem: {
        letter: "",
        series_start: 0,
        series_end: 0,
        number_start: 0,
        number_end: 0,
        result: 0,
      },
      editedIndex: -1,
      defaultItem: {
        letter: "",
        series_start: 0,
        series_end: 0,
        number_start: 0,
        number_end: 0,
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
          line: { shape: "hv" },
          name: "Первый счетчик",
        },
        {
          x: [],
          y: [],
          type: "scatter",
          line: { shape: "hv" },
          name: "Второй счетчик",
        },
      ],
      validate: false,
      maintainance: false,
      exportParameter: false,
      gid: null,
      tax: null,
      rules: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
        (value) => value[0] !== "0" || "Первый символ не должен быть нулем.",
      ],
    };
  },
  computed: {
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
    vlcVariants() {
      return this.$store.getters.LOAD_VLC_VARIANTS;
    },
    pkcVariants() {
      return this.$store.getters.LOAD_PKC_VARIANTS;
    },
    pdcVariants() {
      return this.$store.getters.LOAD_PDC_VARIANTS;
    },
    lineData() {
      let key = this.$route.params.key;
      let lines = this.$store.getters.LOAD_LINES;
      for (let i = 0; i < lines.length; i++)
        for (let j = 0; j < lines[i].length; j++) {
          if (lines[i][j].key === key) {
            return lines[i][j];
          }
        }
      return lines;
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
            product: lines.timetable[i].product + ' --- ' + lines.timetable[i].packing,
            gid: lines.timetable[i].gid,
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
    dialogAdd: function (value) {
      value || this.closeAdd();
    },
    dialogDelete: function (value) {
      value || this.closeDelete();
    },
    gid: function (value) {
      this.changeExport(value);
    },
    tax_s: function () {
      this.validateField();
    },
    tax_f: function () {
      this.validateField();
    },
    tax: function () {
      this.validateField();
    },
  },
  methods: {
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
      this.editedItem.result =
        this.editedItem.number_end - this.editedItem.number_start + 1;
      if (this.editedIndex > -1) {
        Object.assign(this.values[this.editedIndex], this.editedItem);
      } else {
        this.values.push(this.editedItem);
      }
      this.closeAdd();
    },
    validateField() {
      this.$refs.form.validate();
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
    sendTaskButton: function () {
      let form = new FormData();
      form.append("redkey", this.$route.params.key);
      form.append("req_action", "set_data");
      form.append("gid", this.maintainance ? 0 : this.gid);
      form.append("vlc", this.vlc);
      form.append("pdc", this.pdc);
      form.append("pkc", this.pkc);
      form.append("cnt", this.exportParameter ? this.tax : this.taxSum);
      form.append("txc", this.taxType);
      form.append("tax", JSON.stringify(this.transformTax()));
      axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Задание отправлено на счетчики.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка ввода задания. Повторите ввод!",
          });
        });
    },
    sendTaxButton: function () {
      let form = new FormData();
      form.append("redkey", this.$route.params.key);
      form.append("req_action", "alter_tax");
      form.append("tax", JSON.stringify(this.transformTax()));
      form.append("cnt", this.taxSum);
      axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Отправлена команда запуска линии.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка отправки команды запуска. Попробуйте снова!",
          });
        });
    },
    startButton: function () {
      let form = new FormData();
      form.append("redkey", this.$route.params.key);
      form.append("req_action", "job_start");
      axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Отправлена команда запуска линии.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка отправки команды запуска. Попробуйте снова!",
          });
        });
    },
    stopButton: function () {
      let form = new FormData();
      form.append("redkey", this.$route.params.key);
      form.append("req_action", "job_stop");
      axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Отправлена команда остановки линии.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка отправки команды остановки. Попробуйте снова!",
          });
        });
    },
    dataEraseButton: function () {
      let form = new FormData();
      form.append("redkey", this.$route.params.key);
      form.append("req_action", "job_cancel");
      axios
        .post("http://attp.kristal.local:5000/vue", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Отправлена команда запуска линии.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка отправки команды запуска. Попробуйте снова!",
          });
        });
    },
  },
  mounted() {
    axios
      .get("http://attp.kristal.local:5000/chart?c=" + this.$route.params.key.slice(0, 5) +"&a=1", {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((response) => {
        let keys = Object.keys(response.data.lines);
        let plots = Object.values(response.data.lines);
        for (let i = 0; i < keys.length; i++) {
          if (this.$route.params.key === keys[i]) {
            if (plots[i].plot["1"]) {
              for (let k = 0; k < plots[i].plot["1"].length; k++) {
                this.series[0].x.push(plots[i].plot["1"][k][0]);
                this.series[0].y.push(plots[i].plot["1"][k][1]);
              }
            }
            if (plots[i].plot["2"]) {
              for (let k = 0; k < plots[i].plot["2"].length; k++) {
                this.series[1].x.push(plots[i].plot["2"][k][0]);
                this.series[1].y.push(plots[i].plot["2"][k][1]);
              }
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
    this.$store.dispatch("GET_PRODUCTION_DATA", this.$route.params.key);
  },
};
</script>
