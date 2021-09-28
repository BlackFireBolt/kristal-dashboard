import Vue from "vue";
import VueRouter from "vue-router";
import { store } from "../config/vuex-config.js";

Vue.use(VueRouter);

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../Login.vue"),
    meta: { guest: true, title: "Вход в систему" },
  },
  {
    path: "/",
    component: () => import("../Main.vue"),
    children: [
      {
        alias: "",
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/Dashboard.vue"),
        meta: { requiresAuth: true, title: "Панель администратора" },
      },
      {
        path: "manage",
        name: "Manage",
        component: () => import("../views/Manage.vue"),
        meta: { requiresAuth: true, title: "Панель управления" },
      },
      {
        path: "manage/control/:key",
        name: "Control",
        component: () => import("../views/Control.vue"),
        meta: { requiresAuth: true, title: "Панель управления линией" },
      },
      {
        path: "maintenance",
        name: "Maintenance",
        component: () => import("../views/Maintenance.vue"),
        meta: { requiresAuth: true, title: "Планово-предупредительный ремонт" },
      },
      {
        path: "metrics",
        name: "Metrics",
        component: () => import("../views/Metrics.vue"),
        meta: { requiresAuth: true, title: "Метрика" },
      },
    ],
  },
  {
    path: "*",
    component: () => import("../404.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.LOAD_AUTHENTICATION) {
      sessionStorage.setItem("redirectPath", to.path);
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
