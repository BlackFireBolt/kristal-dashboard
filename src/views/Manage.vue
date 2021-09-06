<template>
  <v-row>
    <v-col
      cols="12"
      md="6"
      sm="12"
      xs="12"
      v-for="item in linesList"
      :key="item.id"
    >
      <v-card elevation="5">
        <v-card-text>
          <v-list-item-title class="headline mb-1"
            >Линия № {{ item.line_id }}</v-list-item-title
          ><v-sheet width="100%" height="150">
            <v-container>
              <status
                :status="item.status"
                :statusPv="item.statusPv"
                :statusSp="item.statusSp"
                :accident="item.accidentStatus"
              /> </v-container
          ></v-sheet>

          <div v-if="item.timetable">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header class="mb-2"
                  >Заданий:
                  {{ item.timetable.length }}</v-expansion-panel-header
                >
                <v-expansion-panel-content>
                  <v-card
                    elevation="2"
                    class="mb-3"
                    v-for="(value, index) in item.timetable"
                    :key="index"
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
                              <td>{{ value.pstart }} - {{ value.pfinish }}</td>
                            </tr>
                            <tr>
                              <td>Название</td>
                              <td>{{ value.product }}</td>
                            </tr>
                            <tr>
                              <td>Объем</td>
                              <td>{{ value.vol }}</td>
                            </tr>
                            <tr>
                              <td>Упаковка</td>
                              <td>{{ value.packing }}</td>
                            </tr>
                            <tr>
                              <td>Количество</td>
                              <td>{{ value.cnt }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>
                      <p>Цифровой код(ID): {{ value.gid }}</p>
                    </v-card-text>
                  </v-card>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
          <v-card-subtitle v-else>Нет заданий</v-card-subtitle>
        </v-card-text>
        <v-card-actions>
          <v-btn
            block
            color="primary"
            @click="
              $router.push({
                name: 'Control',
                params: {
                  key: item.key,
                },
              })
            "
          >
            Управление
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import Status from "../components/Status.vue";

export default {
  name: "Manage",
  components: { Status },
  data() {
    return {};
  },
  computed: {
    linesList() {
      return this.$store.getters.LOAD_LINES;
    },
    loadDataList() {
      return this.$store.getters.LOAD_DATA;
    },
  },
};
</script>
