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
    { key: '7', hotkey: '1-9', action: '取点 1-9' },
    { key: '7', hotkey: '鼠标左键', action: '取点至 n+1' },
    { key: '8', hotkey: 'Z', action: '清空点列表' },
    { key: '9', hotkey: 'X', action: '清空范围' },
    { key: '10', hotkey: 'C', action: '重新抓取已选点颜色' },
    { key: '11', hotkey: 'R', action: '加载远程图片' },
    { key: '12', hotkey: 'T', action: '加载本地图片' },
    { key: '13', hotkey: 'N', action: '切换加载远程图片模式' },
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
    <a-typography :style="{ width: '70%', margin: '16px' }">
        <a-typography-title :level="2">加载图片</a-typography-title>
        <a-typography-title :level="4">从远程加载图片</a-typography-title>
        <a-typography-paragraph> Snapshop 支持从 HTTP / HTTPS / WS 加载图片。 </a-typography-paragraph>
        <a-typography-paragraph> 这需要你运行一个服务程序以提供图片。 </a-typography-paragraph>
        <a-typography-title :level="4">从 HTTP(S) 加载图片</a-typography-title>
        <a-typography-paragraph> Snapshop 会请求 ArrayBuffer 的格式类型，请从接口直接返回图片。 </a-typography-paragraph>
        <a-typography-paragraph> 请正确配置 CORS ，否则，这将可能导致无法加载图片。 </a-typography-paragraph>
        <a-typography-link href="https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS" target="_blank"> 什么是 CORS ？ </a-typography-link>
        <a-typography-title :level="4">从 WS 加载图片</a-typography-title>
        <a-typography-paragraph> WS 是更为推荐远程加载图片方式。 </a-typography-paragraph>
        <a-typography-paragraph> 交互应遵循以下接口： </a-typography-paragraph>
        <a-typography-paragraph :code="true">
            interface SnapshotCommand { cmd: 'snapshot'; data: { success: boolean; message: string; file: number[] }; }
        </a-typography-paragraph>
        <a-typography-paragraph> Snapshop 截图时会发送： </a-typography-paragraph>
        <a-typography-paragraph :code="true"> { cmd: 'snapshot'; data: { success: true; message: ""; file: [] }; } </a-typography-paragraph>
        <a-typography-paragraph> 服务程序应发送以完成交互： </a-typography-paragraph>
        <a-typography-paragraph :code="true"> { cmd: 'snapshot'; data: { success: true; message: ""; file: [0,0,0,...] }; } </a-typography-paragraph>

        <a-typography-title :level="2">采集</a-typography-title>
        <a-typography-title :level="4">快捷键</a-typography-title>
        <a-typography-paragraph> Snapshop 支持 WASD / 上下左右 两套操作方案。 </a-typography-paragraph>
        <a-typography-paragraph>
            <a-table :columns="sampleHotkeysColumns" :data-source="sampleHotkeys" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>

        <a-typography-title :level="2">生成代码</a-typography-title>
        <a-typography-title :level="4">快捷键</a-typography-title>
        <a-typography-paragraph> 在主面板可以通过快捷键生成代码。 </a-typography-paragraph>
        <a-typography-paragraph>
            <a-table :columns="generateCodeHotkeysColumns" :data-source="generateCodeHotkeys" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
        <a-typography-title :level="4">关键字</a-typography-title>
        <a-typography-paragraph> 在 模板 中填入关键字，生成代码时会自动替换为对应变量，如果有高级需求，请填写正则表达式进行替换。 </a-typography-paragraph>
        <a-typography-paragraph> $point[n] 关键字 在 模板 中， n 需替换为对应有效点的序号。 </a-typography-paragraph>
        <a-typography-paragraph> $point[n] 关键字 在 points构成定义 中，无需替换。 </a-typography-paragraph>
        <a-typography-paragraph>
            <a-table :columns="keywordsColumns" :data-source="keywords" bordered size="small" :pagination="false"></a-table>
        </a-typography-paragraph>
    </a-typography>
</template>

<style scoped></style>
