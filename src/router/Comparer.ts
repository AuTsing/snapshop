import { IRoute } from './IRoute';
import ComparerVue from '../view/Comparer.vue';
import { BlockOutlined } from '@ant-design/icons-vue';

const Comparer: IRoute = {
    key: 'comparer',
    view: ComparerVue,
    title: '图片比较器',
    icon: BlockOutlined,
};

export default Comparer;
