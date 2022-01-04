import { IRoute } from './IRoute';
import CodeGeneratorVue from '../view/CodeGenerator.vue';
import { CodeOutlined } from '@ant-design/icons-vue';

const CodeGenerator: IRoute = {
    key: 'code-generator',
    view: CodeGeneratorVue,
    title: '生成代码',
    icon: CodeOutlined,
};

export default CodeGenerator;
