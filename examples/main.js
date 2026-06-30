import {createApp} from 'vue';
import Antd from 'antdv-next';
import 'antdv-next/dist/reset.css';
import formCreate from '@form-create/antdv-next';
import App from './App.vue';
import FcDesigner from '../src/index';

const app = createApp(App);

app.use(Antd);
app.use(formCreate);
app.use(FcDesigner);


app.mount('#app')
