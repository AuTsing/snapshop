import { IRoute } from './IRoute';
import PickerVue from '../view/Picker.vue';
import { AimOutlined } from '@ant-design/icons-vue';

const Picker: IRoute = {
    key: 'picker',
    view: PickerVue,
    title: '主面板',
    icon: AimOutlined,
};

export default Picker;
