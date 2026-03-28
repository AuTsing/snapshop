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

export interface Route {
    key: string;
    title: string;
    icon: CodepenOutlinedIconType;
    view: DefineComponent<{}, {}, any>;
}

const picker: Route = {
    key: 'picker',
    title: '主面板',
    icon: CodepenOutlined,
    view: PickerVue,
};

const codeGenerator: Route = {
    key: 'code-generator',
    title: '生成代码',
    icon: CodeOutlined,
    view: CodeGeneratorVue,
};

const comparer: Route = {
    key: 'comparer',
    title: '图片比较器',
    icon: BlockOutlined,
    view: ComparerVue,
};

const fontLab: Route = {
    key: 'font-lab',
    title: '字库',
    icon: FontColorsOutlined,
    view: FontLabVue,
};

const setting: Route = {
    key: 'setting',
    title: '设置',
    icon: SettingOutlined,
    view: SettingVue,
};

const help: Route = {
    key: 'help',
    title: '帮助',
    icon: QuestionCircleOutlined,
    view: HelpVue,
};

export const routes: Route[] = [picker, codeGenerator, comparer, fontLab, setting, help];
