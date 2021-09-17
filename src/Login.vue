<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md4>
      <v-card class="elevation-5">
        <v-toolbar dark color="primary">
          <v-toolbar-title
            >Авторизация пользователя</v-toolbar-title
          > </v-toolbar
        ><v-form
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
            <v-btn type="submit" color="primary">Вход в систему</v-btn>
          </v-card-actions>
          </v-form>
      </v-card>
    </v-flex>
    <notifications position="bottom right" />
  </v-layout>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      form: {
        validate: false,
        username: "",
        password: "",
        usernameRules: [(value) => !!value || "Введите значение."],
        passwordRules: [(value) => !!value || "Введите значение."],
      },
    };
  },
  watch: {
    username: function () {
      this.validateField();
    },
    password: function () {
      this.validateField();
    },
  },
  methods: {
    validateField() {
      this.$refs.form_auth.validate();
    },
    async submit() {
      this.validateField();
      await this.$store
        .dispatch("LOGIN", {
          username: this.form.username,
          password: this.form.password,
        })
        .then(() => {
          this.$router.replace(sessionStorage.getItem("redirectPath") || "/");
          sessionStorage.removeItem("redirectPath");
        });
    },
  },
};
</script>
