import { createApp } from "vue";
import "./style.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import App from "./App.vue";
import router from "./routes/router";
// import {} from 'bootstrap'

const app = createApp(App);

app.use(router);

app.mount("#app");
