import { createApp } from "vue";
import App from "./App.vue";

// Import PrimeVue
import PrimeVue from "primevue/config";

// Import PrimeVue theme and styles
// import "primevue/resources/themes/aura-light-green/theme.css";
// import "primevue/resources/themes/lara-dark-green/theme.css";

import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import 'primeflex/primeflex.css';
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import PrimeVue components
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Paginator from "primevue/paginator";
import Dialog from "primevue/dialog";
import ToastService from "primevue/toastservice";
import router from "./router";


// Create the Vue app
const app = createApp(App);

// Use PrimeVue
app.use(PrimeVue);
app.use(ToastService);

// Use Router
app.use(router);

// Register PrimeVue components globally
app.component("InputText", InputText);
app.component("Button", Button);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Paginator", Paginator);
app.component("Dialog", Dialog);

// Mount the app
app.mount("#app");
