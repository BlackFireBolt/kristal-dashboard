<template>
  <div>
    <v-tabs v-model="tab">
      <v-tab> Лог событий </v-tab>
      <v-tab> Управление пользователями </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <v-card>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="1">
                <v-btn
                  @click="loadLog"
                  icon
                  elevation="2"
                  class="mb-2"
                  outlined
                  color="green"
                  ><v-icon>mdi-update</v-icon></v-btn
                ></v-col
              ><v-col cols="12" sm="2"
                ><div class="limit">
                  <v-text-field
                    v-model="limit"
                    outlined
                    dense
                    label="Лимит записей"
                    type="number"
                  ></v-text-field></div></v-col
            ></v-row>
            <v-data-table
              :headers="log_headers"
              :items="log"
              :items-per-page="20"
              :footer-props="{
                'items-per-page-options': [20, 30, 40, 50],
              }"
            ></v-data-table>
          </v-card-text>
        </v-card>
      </v-tab-item>
      <v-tab-item>
        <v-card>
          <v-row>
            <v-col :cols="2">
              <v-tabs v-model="tabUsers" vertical>
                <v-tab> <v-icon left> mdi-account </v-icon>Пользователи </v-tab>
                <v-tab> <v-icon left> mdi-account-cog </v-icon>Роли </v-tab>
              </v-tabs>
            </v-col>
            <v-col :cols="10">
              <v-tabs-items v-model="tabUsers">
                <v-tab-item>
                  <v-card flat
                    ><v-card-text>
                      <v-data-table
                        :headers="users_headers"
                        :items="users"
                        :items-per-page="20"
                        :footer-props="{
                          'items-per-page-options': [20, 30, 40, 50],
                        }"
                      >
                        <template v-slot:top>
                          <v-toolbar flat>
                            <v-spacer></v-spacer>
                            <v-dialog
                              v-model="dialogCreateUser"
                              max-width="650px"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  color="primary"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                  >Новый пользователь</v-btn
                                >
                              </template>
                              <v-card>
                                <v-card-title>
                                  <span class="text-h5">{{
                                    formTitleUser
                                  }}</span>
                                </v-card-title>
                                <v-form
                                  ref="formUsers"
                                  lazy-validation
                                  v-model="validateUser"
                                >
                                  <v-card-text>
                                    <v-container>
                                      <v-text-field
                                        v-model="editedItemUser.name"
                                        label="Имя"
                                        :rules="rule"
                                      ></v-text-field>
                                      <v-text-field
                                        v-model="editedItemUser.username"
                                        label="Логин"
                                        :rules="rule"
                                      ></v-text-field>
                                      <v-text-field
                                        v-if="editedIndexUser === -1"
                                        v-model="editedItemUser.password"
                                        label="Пароль"
                                        :rules="rule"
                                      ></v-text-field>
                                      <v-text-field
                                        v-model="editedItemUser.pin"
                                        label="ПИН-код"
                                        :rules="rule"
                                      ></v-text-field>
                                      <v-select
                                        v-model="editedItemUser.role_id"
                                        :items="roles"
                                        label="Роль"
                                        item-text="name"
                                        item-value="id"
                                        :rules="ruleRoleSelect"
                                        data-vv-name="Роль"
                                        filled
                                        required
                                      ></v-select>
                                      <v-checkbox
                                        v-model="editedItemUser.active"
                                        label="Активный"
                                      ></v-checkbox>
                                    </v-container>
                                  </v-card-text>

                                  <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      color="blue darken-1"
                                      text
                                      @click="closeCreateUser"
                                    >
                                      Отмена
                                    </v-btn>
                                    <v-btn
                                      color="blue darken-1"
                                      text
                                      @click="saveUsers"
                                    >
                                      Сохранить
                                    </v-btn>
                                  </v-card-actions>
                                </v-form>
                              </v-card>
                            </v-dialog>
                            <v-dialog
                              v-model="dialogPasswordUser"
                              max-width="500px"
                            >
                              <v-card>
                                <v-card-title class="text-h5"
                                  >Подтверждение удаления</v-card-title
                                >
                                <v-card-text>
                                  <v-container>
                                    <v-text-field
                                      v-model="new_password"
                                      label="Пароль"
                                      :rules="rule"
                                    ></v-text-field>
                                  </v-container>
                                </v-card-text>
                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="closeChangePasswordUsers"
                                    >Отмена</v-btn
                                  >
                                  <v-btn
                                    color="blue darken-1"
                                    dark
                                    @click="confirmPasswordUsers"
                                    >Подтвердить</v-btn
                                  >
                                  <v-spacer></v-spacer>
                                </v-card-actions>
                              </v-card>
                            </v-dialog>
                          </v-toolbar>
                        </template>
                        <template v-slot:[`item.actions`]="{ item }">
                          <v-icon
                            small
                            class="mr-2"
                            @click="editItemUsers(item)"
                          >
                            mdi-pencil
                          </v-icon>
                          <v-icon small @click="changePasswordUsers(item)">
                            mdi-lock
                          </v-icon>
                        </template>
                        <template v-slot:[`item.active`]="{ item }">
                          <v-simple-checkbox
                            v-model="item.active"
                            disabled
                          ></v-simple-checkbox>
                        </template>
                        <template v-slot:no-data>
                          <p>Нет доступных значений</p>
                        </template>
                      </v-data-table>
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item>
                  <v-card flat>
                    <v-data-table
                      :headers="roles_headers"
                      :items="roles"
                      :items-per-page="20"
                      :footer-props="{
                        'items-per-page-options': [20, 30, 40, 50],
                      }"
                    >
                      <template v-slot:top>
                        <v-toolbar flat>
                          <v-spacer></v-spacer>
                          <v-dialog
                            v-model="dialogCreateRole"
                            max-width="650px"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                color="primary"
                                dark
                                v-bind="attrs"
                                v-on="on"
                                >Новая роль</v-btn
                              >
                            </template>
                            <v-card>
                              <v-card-title>
                                <span class="text-h5">{{ formTitleRole }}</span>
                              </v-card-title>
                              <v-form
                                ref="formRoles"
                                lazy-validation
                                v-model="validateRole"
                              >
                                <v-card-text>
                                  <v-container>
                                    <v-text-field
                                      v-model="editedItemRole.name"
                                      label="Имя"
                                      :rules="rule"
                                    ></v-text-field>
                                    <v-text-field
                                      v-model="editedItemRole.description"
                                      label="Описание"
                                      :rules="rule"
                                    ></v-text-field>
                                    <v-text-field
                                      v-model="editedItemRole.rights_code"
                                      label="Код прав"
                                      :rules="rule"
                                    ></v-text-field>
                                    <v-select
                                      v-model="editedItemRole.channels"
                                      :items="channels"
                                      label="Доступные каналы"
                                      :rules="ruleChannels"
                                      data-vv-name="Доступные каналы"
                                      multiple
                                    ></v-select>
                                    <v-checkbox
                                      v-model="editedItemRole.is_superuser"
                                      label="Суперпользователь"
                                    ></v-checkbox>
                                  </v-container>
                                </v-card-text>

                                <v-card-actions>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="closeCreateRole"
                                  >
                                    Отмена
                                  </v-btn>
                                  <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="saveRoles"
                                  >
                                    Сохранить
                                  </v-btn>
                                </v-card-actions>
                              </v-form>
                            </v-card>
                          </v-dialog>
                          <v-dialog
                            v-model="dialogDeleteRole"
                            max-width="500px"
                          >
                            <v-card>
                              <v-card-title class="text-h5"
                                >Подтверждение удаления</v-card-title
                              >
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                  color="blue darken-1"
                                  text
                                  @click="closeDeleteRole"
                                  >Отмена</v-btn
                                >
                                <v-btn
                                  color="blue darken-1"
                                  dark
                                  @click="deleteItemRolesConfirm"
                                  >Подтвердить</v-btn
                                >
                                <v-spacer></v-spacer>
                              </v-card-actions>
                            </v-card>
                          </v-dialog>
                        </v-toolbar>
                      </template>
                      <template v-slot:[`item.actions`]="{ item }">
                        <v-icon small class="mr-2" @click="editItemRoles(item)">
                          mdi-pencil
                        </v-icon>
                        <v-icon small @click="deleteItemRoles(item)">
                          mdi-delete
                        </v-icon>
                      </template>
                      <template v-slot:[`item.is_superuser`]="{ item }">
                        <v-simple-checkbox
                          v-model="item.is_superuser"
                          disabled
                        ></v-simple-checkbox>
                      </template>
                      <template v-slot:no-data>
                        <p>Нет доступных значений</p>
                      </template>
                    </v-data-table>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminPage",
  data() {
    return {
      validateUser: false,
      dialogCreateUser: false,
      dialogPasswordUser: false,
      validateRole: false,
      dialogCreateRole: false,
      dialogDeleteRole: false,
      editedIndexUser: -1,
      editedIndexRole: -1,
      channels: ["c1_s1", "c2_s2", "c2_s3"],
      editedItemUser: {
        name: "",
        username: "",
        role_id: "",
        pin: "",
        active: true,
        password: "",
      },
      defaultItemUser: {
        name: "",
        username: "",
        role_id: "",
        pin: "",
        active: true,
        password: "",
      },
      new_password: "",
      editedItemRole: {
        name: "",
        description: "",
        is_superuser: false,
        rights_code: "",
        channels: [],
      },
      defaultItemRole: {
        name: "",
        description: "",
        is_superuser: false,
        rights_code: "",
        channels: [],
      },
      limit: 100,
      logTimeout: null,
      tab: null,
      tabUsers: null,
      log_headers: [
        {
          text: "ID",
          align: "start",
          value: "id",
        },
        {
          text: "Описание",
          value: "description",
        },
        {
          text: "Пользователь",
          value: "user",
        },
        {
          text: "Дата и время",
          value: "event_date",
        },
      ],
      users_headers: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Логин", value: "username" },
        { text: "Роль", value: "role_name" },
        { text: "Активный", value: "active" },
        { text: "Действия", value: "actions", sortable: false },
      ],
      roles_headers: [
        { text: "ID", align: "start", value: "id" },
        { text: "Имя", value: "name" },
        { text: "Описание", value: "description" },
        { text: "Суперпользователь", value: "is_superuser" },
        { text: "Код прав", value: "rights_code" },
        { text: "Доступные каналы", value: "channels" },
        { text: "Действия", value: "actions", sortable: false },
      ],
      log: [],
      users: [],
      roles: [],
      rule: [(value) => !!value || "Введите значение."],
      ruleRoleSelect: [(value) => !!value || "Введите значение"],
      ruleChannels: [(value) => !!value || "Введите значение"],
    };
  },
  computed: {
    formTitleUser() {
      return this.editedIndexUser === -1
        ? "Новый пользователь"
        : "Редактировать пользователя";
    },
    formTitleRole() {
      return this.editedIndexRole === -1 ? "Новая роль" : "Редактировать роль";
    },
  },
  methods: {
    async saveRoles() {
      if (this.$refs.formRoles.validate()) {
        if (this.editedIndexRole > -1) {
          await axios
            .put(
              "http://auth.vmvisioprom.kristal.local/api/database/roles/" +
                this.roles[this.editedIndexRole].id,
              this.editedItemRole,
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
                },
              }
            )
            .then(() => {
              this.$notify({
                title: "Уведомление",
                type: "success",
                text: "Роль успешно отредактирована!",
              });
              this.loadRoles();
            })
            .catch(() => {
              this.$notify({
                title: "Уведомление",
                type: "error",
                text: "Ошибка редактирования роли!",
              });
            });
        } else {
          await axios
            .post(
              "http://auth.vmvisioprom.kristal.local/api/database/roles/",
              this.editedItemRole,
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
                },
              }
            )
            .then(() => {
              this.$notify({
                title: "Уведомление",
                type: "success",
                text: "Роль успешно создана!",
              });
              this.loadRoles();
            })
            .catch(() => {
              this.$notify({
                title: "Уведомление",
                type: "error",
                text: "Ошибка создания роли!",
              });
            });
        }
        this.$refs.formRoles.resetValidation();
        this.closeCreateRole();
      }
    },
    async deleteItemRolesConfirm() {
      await axios
        .delete(
          "http://auth.vmvisioprom.kristal.local/api/database/roles/" +
            this.roles[this.editedIndexRole].id,
          {
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
            },
          }
        )
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Роль успешно удалена!",
          });
          this.loadRoles();
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка удаления роли!",
          });
        });
      this.closeDeleteRole();
    },
    closeDeleteRole() {
      this.dialogDeleteRole = false;
      this.$nextTick(() => {
        this.editedItemRole = Object.assign({}, this.defaultItemRole);
        this.editedIndexRole = -1;
      });
    },
    closeCreateRole() {
      this.dialogCreateRole = false;
      this.$nextTick(() => {
        this.editedItemRole = Object.assign({}, this.defaultItemRole);
        this.editedIndexRole = -1;
      });
    },
    deleteItemRoles(item) {
      this.editedIndexRole = this.roles.indexOf(item);
      this.editedItemRole = Object.assign({}, item);
      this.dialogDeleteRole = true;
    },
    editItemRoles(item) {
      this.editedIndexRole = this.roles.indexOf(item);
      this.editedItemRole = Object.assign({}, item);
      this.dialogCreateRole = true;
    },

    async saveUsers() {
      if (this.$refs.formUsers.validate()) {
        if (this.editedIndexUser > -1) {
          await axios
            .put(
              "http://auth.vmvisioprom.kristal.local/api/database/users/" +
                this.users[this.editedIndexUser].id,
              this.editedItemUser,
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
                },
              }
            )
            .then(() => {
              this.$notify({
                title: "Уведомление",
                type: "success",
                text: "Пользователь успешно отредактирован!",
              });
              this.loadUsers();
            })
            .catch(() => {
              this.$notify({
                title: "Уведомление",
                type: "error",
                text: "Ошибка редактирования пользователя!",
              });
            });
        } else {
          await axios
            .post(
              "http://auth.vmvisioprom.kristal.local/api/database/users/",
              this.editedItemUser,
              {
                headers: {
                  "Content-type": "application/json",
                  Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
                },
              }
            )
            .then(() => {
              this.$notify({
                title: "Уведомление",
                type: "success",
                text: "Пользователь успешно создан!",
              });
              this.loadUsers();
            })
            .catch(() => {
              this.$notify({
                title: "Уведомление",
                type: "error",
                text: "Ошибка создания пользователя!",
              });
            });
        }
        this.$refs.formUsers.resetValidation();
        this.closeCreateUser();
      }
    },
    changePasswordUsers(item) {
      this.editedIndexUser = this.users.indexOf(item);
      this.dialogPasswordUser = true;
    },
    closeChangePasswordUsers() {
      this.dialogPasswordUser = false;
      this.$nextTick(() => {
        this.new_password = "";
        this.editedIndexUser = -1;
      });
    },
    async confirmPasswordUsers() {
      await axios
        .put(
          "http://auth.vmvisioprom.kristal.local/api/database/users/password/" +
            this.users[this.editedIndexUser].id,
          { password: this.new_password },
          {
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + this.$store.getters.LOAD_TOKEN,
            },
          }
        )
        .then(() => {
          this.$notify({
            title: "Уведомление",
            type: "success",
            text: "Пароль успешно изменен!",
          });
          this.loadUsers();
        })
        .catch(() => {
          this.$notify({
            title: "Уведомление",
            type: "error",
            text: "Ошибка изменения пароля!",
          });
        });
      this.closeChangePasswordUsers();
    },
    closeCreateUser() {
      this.dialogCreateUser = false;
      this.$nextTick(() => {
        this.editedItemUser = Object.assign({}, this.defaultItemUser);
        this.editedIndexUser = -1;
      });
    },
    editItemUsers(item) {
      this.editedIndexUser = this.users.indexOf(item);
      this.editedItemUser = Object.assign({}, item);
      this.dialogCreateUser = true;
    },
    async loadUsers() {
      await axios
        .get(
          "http://auth.vmvisioprom.kristal.local/api/database/users/?skip=0&limit=100",
          {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }
        )
        .then((response) => {
          this.users = response.data;
        });
    },
    async loadRoles() {
      await axios
        .get(
          "http://auth.vmvisioprom.kristal.local/api/database/roles/?skip=0&limit=100",
          { headers: { Accept: "application/json" }, timeout: 1000 * 5 }
        )
        .then((response) => {
          this.roles = response.data;
        });
    },
    async loadLog() {
      await axios
        .get(
          "http://auth.vmvisioprom.kristal.local/api/log/?limit=" + this.limit,
          {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }
        )
        .then((response) => {
          this.log = response.data;
        });
    },
  },
  watch: {
    roles: function (value) {
      for (let i = 0; i < this.users.length; i++) {
        this.users[i].role_name = value.find(
          (x) => this.users[i].role_id === x.id
        ).name;
      }
    },
    limit: function () {
      this.loadLog();
    },
    dialogCreateUser: function (value) {
      value || this.closeCreateUser();
    },
    dialogDeleteUser: function (value) {
      value || this.closeDeleteUser();
    },
  },
  mounted() {
    this.loadLog();
    this.logTimeout = setInterval(() => {
      this.loadLog();
    }, 60000);
    this.loadRoles();
    this.loadUsers();
  },
  beforeDestroy() {
    console.log("destroy");
    clearInterval(this.logTimeout);
  },
};
</script>

<style>
.limit input::-webkit-outer-spin-button,
.limit input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.limit input[type="number"] {
  -moz-appearance: textfield;
}
</style>
