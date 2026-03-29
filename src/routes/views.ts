import {
    BlockOutlined,
    CodeOutlined,
    CodepenOutlined,
    FontColorsOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue';
import { h, type DefineComponent, type VNode } from 'vue';
import PickerVue from '../view/Picker.vue';
import CodeGeneratorVue from '../view/CodeGenerator.vue';
import ComparerVue from '../view/Comparer.vue';
import FontLabVue from '../view/FontLab.vue';
import SettingVue from '../view/Setting.vue';
import HelpVue from '../view/Help.vue';

export interface View {
    path: string;
    content: DefineComponent<{}, {}, any>;
    key: string;
    icon: () => VNode;
    title: string;
}

const picker: View = {
    path: '/',
    content: PickerVue,
    key: 'picker',
    icon: () => h(CodepenOutlined),
    title: '主面板',
};

const codeGenerator: View = {
    path: '/code-generator',
    content: CodeGeneratorVue,
    key: 'code-generator',
    icon: () => h(CodeOutlined),
    title: '生成代码',
};

const comparer: View = {
    path: '/comparer',
    content: ComparerVue,
    key: 'comparer',
    icon: () => h(BlockOutlined),
    title: '图片比较器',
};

const fontLab: View = {
    path: '/font-lab',
    content: FontLabVue,
    key: 'font-lab',
    icon: () => h(FontColorsOutlined),
    title: '字库',
};

const setting: View = {
    path: '/setting',
    content: SettingVue,
    key: 'setting',
    icon: () => h(SettingOutlined),
    title: '设置',
};

const help: View = {
    path: '/help',
    content: HelpVue,
    key: 'help',
    icon: () => h(QuestionCircleOutlined),
    title: '帮助',
};

export const views: View[] = [picker, codeGenerator, comparer, fontLab, setting, help];
