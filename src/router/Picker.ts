import { IRoute } from './IRoute';
import PickerVue from '../view/Picker.vue';
import { CodepenOutlined } from '@ant-design/icons-vue';

const Picker: IRoute = {
    key: 'picker',
    view: PickerVue,
    title: '主面板',
    icon: CodepenOutlined,
};

export default Picker;
