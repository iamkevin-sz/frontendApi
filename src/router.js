import { createRouter, createWebHistory } from "vue-router";

import MostrarProductos from "./components/Productos/MostrarProductos.vue";
import MostrarSucursales from "./components/Sucursales/MostrarSucursales.vue";
import Inicio from "./components/Inicio/Inicio.vue";

const routes = [
  { path: "/", component: Inicio },
  { path: "/productos", component: MostrarProductos },
  { path: "/sucursales", component: MostrarSucursales },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
