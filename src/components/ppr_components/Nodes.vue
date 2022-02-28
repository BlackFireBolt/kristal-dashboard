<template>
  <v-data-table
    :headers="headers"
    :items="nodes"
    single-expand
    :expanded.sync="expanded"
    show-expand
    item-key="id"
    hide-default-footer
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Узлы</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialogAddEditNode" max-width="500px">
          <template v-slot:activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              Новый узел
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ addEditNodeTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedNode.name"
                      label="Название узла"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="6">
                    <v-text-field
                      v-model="editedNode.code"
                      label="Код узла"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-select
                  v-if="equipment_id !== -1"
                  v-model="editedNode.equipment_id"
                  :items="equipmentsList"
                  item-value="value"
                  item-text="name"
                  label="Выберите оборудование"
                  data-vv-name="Выберите оборудование"
                ></v-select>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeAddEditNode">
                Отмена
              </v-btn>
              <v-btn color="blue darken-1" dark @click="addEditNode">
                Сохранить
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDeleteNode" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Подтверждение удаления</v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDeleteNode">
                Отмена
              </v-btn>
              <v-btn color="blue darken-1" dark @click="deleteNode">
                Подтвердить
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon small class="mr-2" @click="openEditNode(item)">
        mdi-pencil
      </v-icon>
      <v-icon small @click="openDeleteNode(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <div v-if="nodes.length == 0">Добавьте узлы</div>
      <div v-else>Нет данных</div>
    </template>
    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <materials-comp
          class="ma-5"
          :nodes="nodes"
          :node_id="item.id"
        />
      </td>
    </template>
  </v-data-table>
</template>

<script>
import axios from "axios";
import Materials from "./Materials.vue";

export default {
  name: "Nodes",
  components: { "materials-comp": Materials },
  data() {
    return {
      dialogAddEditNode: false,
      dialogDeleteNode: false,
      nodes: [],
      expanded: [],
      editedNodeIndex: -1,
      editedNode: {
        name: "",
        code: "",
        equipment_id: this.equipment_id,
        materials: [],
      },
      defaultNode: {
        name: "",
        code: "",
        equipment_id: this.equipment_id,
        materials: [],
      },
      headers: [
        { text: "", value: "data-table-expand" },
        { text: "Код оборудования", value: "code" },
        { text: "Имя", align: "start", value: "name" },

        { text: "Действия", value: "actions", sortable: false },
      ],
    };
  },
  watch: {
    $props: {
      handler() {
        this.loadNodes();
        this.editedNode.equipment_id = this.equipment_id
        this.defaultNode.equipment_id = this.equipment_id
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    addEditNodeTitle() {
      return this.editedNodeIndex === -1 ? "Новый узел" : "Редактировать узел";
    },
    equipmentsList() {
      let list = [];
      for (let i = 0; i < this.equipments.length; i++) {
        list.push({
          name: this.equipments[i].name,
          value: this.equipments[i].id,
        });
      }
      return list;
    },
  },
  props: {
    equipment_id: { type: Number, value: -1 },
    equipments: { type: Array, value: null },
  },
  methods: {
    openEditNode(item) {
      this.editedNodeIndex = this.nodes.indexOf(item);
      this.editedNode = Object.assign({}, item);
      this.dialogAddEditNode = true;
    },
    closeAddEditNode() {
      this.dialogAddEditNode = false;
      this.$nextTick(() => {
        this.editedNode = Object.assign({}, this.defaultNode);
        this.editedNodeIndex = -1;
      });
    },
    openDeleteNode(item) {
      this.editedNodeIndex = this.nodes.indexOf(item);
      this.editedNode = Object.assign({}, item);
      this.dialogDeleteNode = true;
    },
    closeDeleteNode() {
      this.dialogDeleteNode = false;
      this.$nextTick(() => {
        this.editedNode = Object.assign({}, this.defaultNode);
        this.editedNodeIndex = -1;
      });
    },
    async addEditNode() {
      if (this.equipment_id === -1) {
        this.editedNode.equipment_id =
          this.equipments[this.equipments.length - 1].id + 1;
      }
      if (this.editedNodeIndex > -1) {
        await axios
          .put(
            "http://127.0.0.1:8000/api/node/" + this.editedNode.id + "/",
            this.editedNode,
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
              text: "Узел отредактирован!",
            });
          });
      } else {
        await axios
          .post("http://127.0.0.1:8000/api/node/", this.editedNode, {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          })
          .then(() => {
            this.$notify({
              title: "Уведомление",
              type: "success",
              text: "Узел добавлен к оборудованию!",
            });
          });
      }
      this.loadNodes();
      this.closeAddEditNode();
    },
    async deleteNode() {
      await axios
        .delete("http://127.0.0.1:8000/api/node/" + this.editedNode.id + "/", {
          headers: { Accept: "application/json" },
        })
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Узел удален!",
          });
        });
      this.loadNodes();
      this.closeDeleteNode();
    },
    async loadNodes() {
      if (this.equipment_id !== -1) {
        await axios
          .get("http://127.0.0.1:8000/api/node/filter/" + this.equipment_id + "/", {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          })
          .then((response) => {
            this.nodes = response.data;
          });
      }
    },
  },
};
</script>
