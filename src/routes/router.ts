import { createRouter, createWebHashHistory } from "vue-router";
import GeneratorRoute from "./Generator.route.vue";
import ConfigBasicRoute from "./ConfigBasic.route.vue";


export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: GeneratorRoute
        },
        {
            path: '/config-basic',
            name: 'config-basic',
            component: ConfigBasicRoute
        }
    ]
});