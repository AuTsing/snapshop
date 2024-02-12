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
    { key: '1', hotkey: 'f', template: '使用流程 1 生成代码并复制' },
    { key: '2', hotkey: 'g', template: '使用流程 2 生成代码并复制' },
    { key: '3', hotkey: 'h', template: '使用流程 3 生成代码并复制' },
    { key: '4', hotkey: 'v', template: '使用流程 4 生成代码并复制' },
    { key: '5', hotkey: 'b', template: '使用流程 5 生成代码并复制' },
    { key: '6', hotkey: 'F', template: '使用流程 6 生成代码并复制' },
    { key: '7', hotkey: 'G', template: '使用流程 7 生成代码并复制' },
    { key: '8', hotkey: 'H', template: '使用流程 8 生成代码并复制' },
    { key: '9', hotkey: 'V', template: '使用流程 9 生成代码并复制' },
    { key: '10', hotkey: 'B', template: '使用流程 10 生成代码并复制' },
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
        <a-typography-paragraph> WS 是更为推荐远程加载图片方式，交互请适配以下协议。 </a-typography-paragraph>
        <a-typography-paragraph> Snapshop 截图时会发送： </a-typography-paragraph>
        <a-typography-paragraph>
            <pre>
{
    cmd: 'snapshot',
    data: { file: [] }
}</pre
            >
        </a-typography-paragraph>
        <a-typography-paragraph> 服务器成功时应响应： </a-typography-paragraph>
        <a-typography-paragraph>
            <pre>
{
    cmd: 'result',
    data: { success: true, message: '' }
}</pre
            >
        </a-typography-paragraph>
        <a-typography-paragraph>
            <pre>
{
    cmd: 'snapshot',
    data: { file: [0,0,0,...] }
}</pre
            >
        </a-typography-paragraph>
        <a-typography-paragraph> 服务器失败时应响应： </a-typography-paragraph>
        <a-typography-paragraph>
            <pre>
{
    cmd: 'result',
    data: { success: false, message: '失败原因' }
}</pre
            >
        </a-typography-paragraph>

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

        <a-typography-title :level="4">组合式可视化生成代码</a-typography-title>
        <a-typography-paragraph>
            生成代码通过 `流程(Flow)` 完成，每一条流程由若干个 `步骤(Step)`
            组成，你需要添加步骤进流程，随后代码生成器会自动根据步骤对数据进行处理输出最终的代码结果。
        </a-typography-paragraph>
        <a-typography-paragraph> 具体步骤使用方法请参考默认流程 1 和流程 2 。 </a-typography-paragraph>
        <a-typography-paragraph> `删除` 步骤会在完成所有 `重复` 步骤后，并在其余步骤执行前执行。 </a-typography-paragraph>
    </a-typography>
</template>

<style scoped></style>
