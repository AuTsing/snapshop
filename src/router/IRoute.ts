import { FunctionalComponent, DefineComponent } from 'vue';
import { AntdIconProps } from '@ant-design/icons-vue/lib/components/AntdIcon';

export interface IRoute {
    key: string;
    view: DefineComponent<{}, {}, any>;
    title: string;
    icon: FunctionalComponent<AntdIconProps>;
}
