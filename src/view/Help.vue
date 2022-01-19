<script setup lang="ts">
const sampleHotkeysColumns = [
    { title: '快捷键', dataIndex: 'hotkey' },
    { title: '操作', dataIndex: 'action' },
];
const sampleHotkeys = [
    { key: '1', hotkey: 'W / 上', action: '光标上移 1 像素' },
    { key: '2', hotkey: 'A / 左', action: '光标左移 1 像素' },
    { key: '3', hotkey: 'S / 下', action: '光标下移 1 像素' },
    { key: '4', hotkey: 'D / 右', action: '光标右移 1 像素' },
    { key: '5', hotkey: 'Q', action: '取范围左上' },
    { key: '6', hotkey: 'E', action: '取范围右下' },
    { key: '7', hotkey: '1-9 / 鼠标左键', action: '取点 1-9' },
    { key: '8', hotkey: 'Z', action: '清空点列表' },
    { key: '9', hotkey: 'X', action: '清空范围' },
    { key: '10', hotkey: 'R', action: '加载远程图片' },
    { key: '11', hotkey: 'T', action: '加载本地图片' },
    { key: '12', hotkey: 'N', action: '切换加载远程图片模式' },
];
const generateCodeHotkeysColumns = [
    { title: '快捷键', dataIndex: 'hotkey' },
    { title: '模板', dataIndex: 'template' },
];
const generateCodeHotkeys = [
    { key: '1', hotkey: 'F', template: '模板1' },
    { key: '2', hotkey: 'G', template: '模板2' },
    { key: '3', hotkey: 'H', template: '模板3' },
    { key: '4', hotkey: 'V', template: '模板4' },
    { key: '5', hotkey: 'B', template: '模板5' },
];
const keywordsColumns = [
    { title: '关键字', dataIndex: 'keyword' },
    { title: '说明', dataIndex: 'instruction' },
];
const keywords = [
    { key: '1', keyword: '$points', instruction: '颜色列表' },
    { key: '2', keyword: '$delta', instruction: '找色差值' },
    { key: '3', keyword: '$area', instruction: '范围' },
    { key: '4', keyword: '$point[n]', instruction: '点n' },
    { key: '5', keyword: '$point[n][x]', instruction: '点n的x坐标' },
    { key: '6', keyword: '$point[n][y]', instruction: '点n的y坐标' },
    { key: '7', keyword: '$point[n][c]', instruction: '点n的c颜色值' },
];
</script>

<template>
    <a-typography :style="{ margin: '16px' }">
        <a-typography-title>加载图片</a-typography-title>
        <a-typography-title :level="2">远程</a-typography-title>
        <a-typography-paragraph style="width: 70%"> Snapshop 支持从 Http/Https 加载图片。 </a-typography-paragraph>
        <a-typography-paragraph style="width: 70%">
            但这需要你自行创建一个后端程序以提供服务，在设置中填入正确的接口地址，就可以从主面板中远程加载图片了。
        </a-typography-paragraph>
        <a-typography-paragraph style="width: 70%"> 注意，后端请正确配置 CORS ，否则，这将可能导致无法加载图片。 </a-typography-paragraph>
        <a-typography-link href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS" target="_blank"> 什么是 CORS ？ </a-typography-link>
        <a-typography-title>采集</a-typography-title>
        <a-typography-title :level="2">快捷键</a-typography-title>
        <a-typography-paragraph style="width: 70%"> Snapshop 支持 WASD / 上下左右 两套操作方案。 </a-typography-paragraph>
        <a-typography-paragraph style="width: 50%">
            <a-table :columns="sampleHotkeysColumns" :data-source="sampleHotkeys" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
        <a-typography-title>生成代码</a-typography-title>
        <a-typography-title :level="2">快捷键</a-typography-title>
        <a-typography-paragraph style="width: 70%"> 在主面板可以通过快捷键生成代码。 </a-typography-paragraph>
        <a-typography-paragraph style="width: 50%">
            <a-table :columns="generateCodeHotkeysColumns" :data-source="generateCodeHotkeys" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
        <a-typography-title :level="2">关键字</a-typography-title>
        <a-typography-paragraph style="width: 70%">
            在模板中填入关键字，生成代码时会自动替换为对应变量，如果有高级需求，请填写正则表达式进行替换。
        </a-typography-paragraph>
        <a-typography-paragraph style="width: 50%">
            <a-table :columns="keywordsColumns" :data-source="keywords" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
    </a-typography>
</template>

<style scoped></style>
