<template>
  <v-data-table
    :headers="headers"
    :items="materials"
    hide-default-footer
    item-key="id"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Материалы</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialogAddEditMaterial" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Новый материал
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ addEditMaterialTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedMaterial.name"
                      label="Название материал"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedMaterial.code"
                      label="Код материала"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedMaterial.overhaul_cycle"
                      label="Цикл переработки"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedMaterial.count"
                      label="Количество"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-select
                  v-if="node_id !== -1"
                  v-model="editedMaterial.node_id"
                  :items="nodesList"
                  item-value="value"
                  item-text="name"
                  label="Выберите узел"
                  data-vv-name="Выберите узел"
                ></v-select>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeAddEditMaterial">
                Отмена
              </v-btn>
              <v-btn color="blue darken-1" dark @click="addEditMaterial">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDeleteMaterial" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Подтверждение удаления</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDeleteMaterial"
                >Отмена</v-btn
              >
              <v-btn color="blue darken-1" dark @click="deleteMaterial"
                >Подтвердить</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="openEditMaterial(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="openDeleteMaterial(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <div v-if="materials.length === 0">Добавьте материалы</div>
      <div v-else>Нет данных</div>
    </template>
    <template v-slot:expanded-item="{ headers }">
      <td :colspan="headers.length">
        <v-data-table></v-data-table>
      </td>
    </template>
  </v-data-table>
</template>

<script>
import axios from "axios";

export default {
  name: "Materials",

  data() {
    return {
      dialogAddEditMaterial: false,
      dialogDeleteMaterial: false,
      editedMaterialIndex: -1,
      materials: [],
      editedMaterial: {
        name: "",
        code: "",
        node_id: 0,
        overhaul_cycle: 0,
        count: 1,
      },
      defaultMaterial: {
        name: "",
        code: "",
        node_id: 0,
        overhaul_cycle: 0,
        count: 1,
      },
      headers: [
        { text: "Код материала", value: "code" },
        { text: "Имя", align: "start", value: "name" },

        { text: "Цикл переработки", value: "overhaul_cycle" },
        { text: "Количество", value: "count" },
        { text: "Действия", value: "actions", sortable: false },
      ],
    };
  },
  computed: {
    nodesList() {
      let list = [];
      for (let i = 0; i < this.nodes.length; i++) {
        list.push({
          name: this.nodes[i].name,
          value: this.nodes[i].id,
        });
      }
      return list;
    },
    addEditMaterialTitle() {
      return this.editedMaterialIndex === -1
        ? "Новый материал"
        : "Редактировать материал";
    },
  },
  watch: {
    $props: {
      handler() {
        this.loadMaterials();
        this.editedMaterial.node_id = this.node_id;
        this.defaultMaterial.node_id = this.node_id;
      },
      deep: true,
      immediate: true,
    },
  },
  props: {
    node_id: { type: Number, value: -1 },
    nodes: { type: Array, value: null },
  },
  methods: {
    openEditMaterial(item) {
      this.editedMaterialIndex = this.materials.indexOf(item);
      this.editedMaterial = Object.assign({}, item);
      this.dialogAddEditMaterial = true;
    },
    closeAddEditMaterial() {
      this.dialogAddEditMaterial = false;
      this.$nextTick(() => {
        this.editedMaterial = Object.assign({}, this.defaultMaterial);
        this.editedMaterialIndex = -1;
      });
    },
    openDeleteMaterial(item) {
      this.editedMaterialIndex = this.materials.indexOf(item);
      this.editedMaterial = Object.assign({}, item);
      this.dialogDeleteMaterial = true;
    },
    closeDeleteMaterial() {
      this.dialogDeleteMaterial = false;
      this.$nextTick(() => {
        this.editedMaterial = Object.assign({}, this.defaultMaterial);
        this.editedMaterialIndex = -1;
      });
    },
    async addEditMaterial() {
      this.editedMaterial.node_id = this.node_id;
      if (this.editedMaterialIndex > -1) {
        await axios
          .put(
            "http://127.0.0.1:8000/api/material/" +
              this.editedMaterial.id +
              "/",
            this.editedMaterial,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              timeout: 1000 * 5,
            }
          )
          .then(() => {
            this.$notify({
              title: "Уведомление",
              type: "success",
              text: "Материал отредактирован!",
            });
          });
      } else {
        await axios
          .post(
            "http://127.0.0.1:8000/api/material/",
            this.editedMaterial + "/",
            {
              headers: { Accept: "application/json" },
              timeout: 1000 * 5,
            }
          )
          .then(() => {
            this.$notify({
              title: "Уведомление",
              type: "success",
              text: "Материал добавлен к узлу!",
            });
          });
      }
      this.loadMaterials();
      this.closeAddEditMaterial();
    },
    async deleteMaterial() {
      await axios
        .delete(
          "http://127.0.0.1:8000/api/material/" + this.editedMaterial.id + "/",
          {
            headers: { Accept: "application/json" },
          }
        )
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Материал удален!",
          });
        });
      this.loadMaterials();
      this.closeDeleteMaterial();
    },
    async loadMaterials() {
      if (this.node_id !== -1) {
        await axios
          .get(
            "http://127.0.0.1:8000/api/material/filter/" + this.node_id + "/",
            { headers: { Accept: "application/json" }, timeout: 1000 * 5 }
          )
          .then((response) => {
            this.materials = response.data;
          });
      }
    },
  },
};
</script>
