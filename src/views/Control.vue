<template>
  <v-card>
    <v-card-text>
      <v-card-title>Линия №{{ lineData.line_id }}</v-card-title>
      <status
        :status="lineData.status"
        :statusPv="lineData.statusPv"
        :statusSp="lineData.statusSp"
        :accident="lineData.accidentStatus" 
      />
      <v-btn
        rounded
        depressed
        color="indigo"
        dark
        @click="$router.push('/manage')"
        ><v-icon dark> mdi-chevron-left </v-icon>Назад</v-btn
      >
    </v-card-text>

    <v-card-text
      ><v-divider></v-divider>
      <v-row>
        <v-col cols="12" sm="12" md="8" xs="12">
          <v-card-text>
            <p v-if="lineData.timetable">
              Количество заданий: {{ lineData.timetable.length }}
            </p>
            <p v-else>Нет заданий</p>
            <p>Количество бутылок в текущем задании: {{ lineData.statusPv}}</p>
          </v-card-text>
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
        <v-col cols="12" md="4" sm="12" xs="12">
          <div>
            <v-card class="mt-4"
              ><v-card-text>
                <v-form ref="form" lazy-validation v-model="validate">
                  <v-switch
                    class="my-3"
                    label="Наладка"
                    color="warning"
                    v-model="maintainance"
                    :false-value="false"
                    :true-value="true"
                    hide-details
                  ></v-switch>
                  <div v-if="!maintainance">
                    <v-select
                      v-model="gid"
                      :items="taskSelect"
                      item-text="product"
                      item-value="gid"
                      label="Выберите задание"
                      filled
                      required
                      v-if="taskSelect"
                    >
                    </v-select>
                    <div v-if="exportParameter">
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
                    </div>
                  </div>
                  <div v-else>
                    <p>Ввод кода продукции, кода объема и код тары</p>
                  </div>
                  <v-btn
                    block
                    elevation="10"
                    color="success"
                    x-large
                    @click="sendTaskButton"
                    :disabled="
                      gid === null || exportParameter
                        ? !validate ||
                          tax === null ||
                          tax_f === null ||
                          tax_s === null
                        : false || lineData.status === 1
                    "
                    >Добавить задание</v-btn
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
          <v-btn block elevation="2" class="my-5" large @click="testStatus"
            >Сброс данных</v-btn
          >
          <v-btn block elevation="2" class="my-5" large disabled
            >Выгрузка данных</v-btn
          ></v-col
        >
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import Status from "../components/Status.vue";
import Accidents from "../components/Accidents.vue";

export default {
  name: "Control",
  components: { Status, Accidents },
  data() {
    return {
      validate: false,
      maintainance: false,
      exportParameter: false,
      gid: null,
      tax_s: null,
      tax_f: null,
      tax: null,
      rules: [
        (value) => !!value || "Введите значение.",
        (value) => (value || "").indexOf(" ") < 0 || "Пробелы запрещены.",
        (value) => !isNaN(value) || "Требуется ввод цифрового значения.",
      ],
    };
  },
  computed: {
    lineData() {
      let key = this.$route.params.key;
      let lines = this.$store.getters.LOAD_LINES;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].key === key) {
          return lines[i];
        }
      }
      return lines;
    },
    taskSelect() {
      let lines = this.lineData;
      var timetable = [];
      if (lines.timetable) {
        for (let i = 0; i < lines.timetable.length; i++) {
          timetable.push({
            product: lines.timetable[i].product,
            gid: lines.timetable[i].gid,
          });
        }
        return timetable;
      } else {
        for (let i = 0; i < Object.keys(lines.product).length; i++) {
          timetable.push({
            product: Object.keys(lines.product)[i],
            gid: i,
          });
        }
        return timetable;
      }
    },
  },
  watch: {
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
    validateField() {
      this.$refs.form.validate();
    },
    changeExport: function (value) {
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
    },
    sendTaskButton: function () {
      let lines = this.lineData.timetable;
      let gid = this.gid;
      if (lines.length == 1) {
        gid = lines[0].gid;
      }
      axios
        .post("http://172.17.0.162:5000/vue", {
          action: 1,
          gid: gid,
          tax_s: this.tax_s,
          tax_f: this.tax_f,
          tax: this.tax,
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
    startButton: function () {
      axios
        .post("http://172.17.0.162:5000/vue", {
          action: 3,
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
      axios
        .post(
          "http://172.17.0.162:5000/vue",
          {
            action: 4,
          },
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        )
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
      axios
        .get("http://127.0.0.1:5000/api", {
          headers: {
            Authorization: this.$store.getters.LOAD_TOKEN,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Отправлена команда очистки данных.",
          });
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка отправки команды очистки данных. Попробуйте снова!",
          });
        });
    },
    testStatus: function () {
      this.$store.dispatch("GET_STATUS", {
        key: this.lineData.key,
        status: this.lineData.status,
      });
    },
  },
};
</script>
