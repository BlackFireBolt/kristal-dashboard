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
        meta: { requiresAuth: true, title: "Панель мониторинга" },
      },
      {
        path: "control/:key",
        name: "Control",
        component: () => import("../views/Control.vue"),
        meta: { requiresAuth: true, title: "Панель управления линией" },
      },
      {
        path: "archive",
        name: "Archive",
        component: () => import("../views/Archive.vue"),
        meta: { requiresAuth: true, title: "Архив" },
      },
      {
        path: "archive/:key/:date",
        name: "ArchiveDetail",
        component: () => import("../views/ArchiveDetail.vue"),
        meta: { requiresAuth: true, title: "Информация о разливке" },
      },
      {
        path: "maintenance",
        name: "Maintenance",
        component: () => import("../views/Maintenance.vue"),
        meta: { requiresAuth: true, title: "Планово-предупредительный ремонт" },
      },
      {
        path: "maintenance/:id",
        name: "MaintenanceDetail",
        component: () => import("../views/MaintenanceDetail.vue"),
        meta: {
          requiresAuth: true,
          title: "Детальная информация об оборудовании",
        },
      },
      {
        path: "metrics",
        name: "Metrics",
        component: () => import("../views/Metrics.vue"),
        meta: { requiresAuth: true, title: "Метрика" },
      },
      {
        path: "adminpage",
        name: "AdminPage",
        component: () => import("../views/AdminPage.vue"),
        meta: { requiresAuth: true, title: "Панель администратора" },
        beforeEnter: (to, from, next) => {
          if ((store.getters.LOAD_USER.rights & 448) == 448) {
            next();
          } else {
            next("/login");
          }
        },
      },
    ],
  },
  {
    path: "*",
    component: () => import("../404.vue"),
  },
];

const router = new VueRouter({
  mode: "hash",
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
