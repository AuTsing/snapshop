import {
    BlockOutlined,
    CodeOutlined,
    CodepenOutlined,
    FontColorsOutlined,
    QuestionCircleOutlined,
    SettingOutlined,
} from '@ant-design/icons-vue';
import { type CodepenOutlinedIconType } from '@ant-design/icons-vue/lib/icons/CodepenOutlined';
import { type DefineComponent } from 'vue';
import PickerVue from '../view/Picker.vue';
import CodeGeneratorVue from '../view/CodeGenerator.vue';
import ComparerVue from '../view/Comparer.vue';
import FontLabVue from '../view/FontLab.vue';
import SettingVue from '../view/Setting.vue';
import HelpVue from '../view/Help.vue';

export interface View {
    path: string;
    key: string;
    title: string;
    icon: CodepenOutlinedIconType;
    content: DefineComponent<{}, {}, any>;
}

const picker: View = {
    path: '/',
    key: 'picker',
    title: '主面板',
    icon: CodepenOutlined,
    content: PickerVue,
};

const codeGenerator: View = {
    path: '/code-generator',
    key: 'code-generator',
    title: '生成代码',
    icon: CodeOutlined,
    content: CodeGeneratorVue,
};

const comparer: View = {
    path: '/comparer',
    key: 'comparer',
    title: '图片比较器',
    icon: BlockOutlined,
    content: ComparerVue,
};

const fontLab: View = {
    path: '/font-lab',
    key: 'font-lab',
    title: '字库',
    icon: FontColorsOutlined,
    content: FontLabVue,
};

const setting: View = {
    path: '/setting',
    key: 'setting',
    title: '设置',
    icon: SettingOutlined,
    content: SettingVue,
};

const help: View = {
    path: '/help',
    key: 'help',
    title: '帮助',
    icon: QuestionCircleOutlined,
    content: HelpVue,
};

export const views: View[] = [picker, codeGenerator, comparer, fontLab, setting, help];
