import { IRoute } from './IRoute';
import HelpVue from '../view/Help.vue';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';

const Help: IRoute = {
    key: 'help',
    view: HelpVue,
    title: '帮助',
    icon: QuestionCircleOutlined,
};

export default Help;
