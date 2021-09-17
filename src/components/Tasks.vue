<template>
   
      <v-card-text>
        <v-card
          elevation="2"
          class="mb-3"
          v-for="(value, index) in tasks"
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
      </v-card-text>

    
</template>

<script>
export default {
  name: "Tasks",
  data() {
    return {};
  },
  props: {
    tasks: { type: Array, default: null },
  },
};
</script>
