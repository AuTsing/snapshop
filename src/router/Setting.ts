import { IRoute } from './IRoute';
import SettingVue from '../view/Setting.vue';
import { SettingOutlined } from '@ant-design/icons-vue';

const Picker: IRoute = {
    key: 'setting',
    view: SettingVue,
    title: '设置',
    icon: SettingOutlined,
};

export default Picker;
