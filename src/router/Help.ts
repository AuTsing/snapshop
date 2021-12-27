import { IRoute } from './IRoute';
import HelpVue from '../view/Help.vue';
import { ReadOutlined } from '@ant-design/icons-vue';

const Help: IRoute = {
    key: 'help',
    view: HelpVue,
    title: '帮助',
    icon: ReadOutlined,
};

export default Help;
