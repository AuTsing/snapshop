import { IRoute } from './IRoute';
import FontLabVue from '../view/FontLab.vue';
import { FontColorsOutlined } from '@ant-design/icons-vue';

const FontLab: IRoute = {
    key: 'font-lab',
    view: FontLabVue,
    title: '字库',
    icon: FontColorsOutlined,
};

export default FontLab;
