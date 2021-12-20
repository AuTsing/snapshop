<script setup lang="ts">
import { ref } from 'vue';

const captureLoading = ref<boolean>(false);
</script>

<template>
    <div class="header-container">
        <a-space :size="10">
            <a-button type="primary" size="large" @click="() => null" :loading="captureLoading" :disabled="captureLoading">加载图片</a-button>
            <a-button type="primary" size="large" @click="() => null" :loading="captureLoading" :disabled="captureLoading">图片比较器</a-button>
            <a-button type="primary" size="large" @click="() => null" :loading="captureLoading" :disabled="captureLoading">制作字库</a-button>
            <a-button type="primary" size="large" @click="() => null" :loading="captureLoading" :disabled="captureLoading">生成代码</a-button>
            <a-button type="primary" size="large" @click="() => null" :loading="captureLoading" :disabled="captureLoading">设置</a-button>
        </a-space>
    </div>
</template>

<style scoped>
.header-container {
    background-color: #1f1f1f;
    height: 64px;
    display: flex;
    align-items: center;
    overflow: auto;
    padding: 0 10px;
}
</style>
