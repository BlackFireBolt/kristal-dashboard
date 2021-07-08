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
    ],
  },
  {
    path:"/ot-dashboard",
    component: () =>{},
    meta: {requiresAuth: false},
    children: [
      {
        alias: "",
        path: "ot-dashboard",
        name: "OT-dashboard",
        component: () => {},
        meta: {requiresAuth: false, layout: "main"}
      },
      {
        path: "admin",
        name: "OT-admin",
        component: () => {},
        meta: {quest: true, layout: "main", auth: true}
      },
      {
        path: "login",
        name: "OT-login",
        component: () => {},
        meta: {quest: true, layout: "empty"}
      }
    ]
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
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!store.getters.LOAD_AUTHENTICATION) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});



router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.quest)) {
    if (store.getters.LOAD_AUTHENTICATION) {
      next("/login");
      return;
    }
    next();
  } else {
    next();
  }
});

export default router;
