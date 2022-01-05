<script setup lang="ts">
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
const hotkeysColumns = [
    { title: '快捷键', dataIndex: 'hotkey' },
    { title: '模板', dataIndex: 'template' },
];
const hotkeys = [
    { key: '1', hotkey: 'F', template: '模板1' },
    { key: '2', hotkey: 'G', template: '模板2' },
    { key: '3', hotkey: 'H', template: '模板3' },
    { key: '4', hotkey: 'V', template: '模板4' },
    { key: '5', hotkey: 'B', template: '模板5' },
];
</script>

<template>
    <a-typography :style="{ margin: '16px' }">
        <a-typography-title>生成代码</a-typography-title>
        <a-typography-title :level="2">快捷键</a-typography-title>
        <a-typography-paragraph> 在主面板可以通过快捷键生成代码。 </a-typography-paragraph>
        <a-typography-paragraph :style="{ width: '50%' }">
            <a-table :columns="hotkeysColumns" :data-source="hotkeys" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
        <a-typography-title :level="2">关键字</a-typography-title>
        <a-typography-paragraph> 在模板中填入关键字，生成代码时会自动替换为对应变量，如果有高级需求，请填写正则表达式进行替换。 </a-typography-paragraph>
        <a-typography-paragraph :style="{ width: '50%' }">
            <a-table :columns="keywordsColumns" :data-source="keywords" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
    </a-typography>
</template>

<style scoped></style>
