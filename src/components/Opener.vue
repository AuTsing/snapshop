<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';
import type { UploadChangeParam } from 'ant-design-vue';

const store = useStore();

const fileList = ref<{ originFileObj: File }[]>([]);

const handleClickOpen = async (params: UploadChangeParam) => {
    if (params.file === params.fileList[params.fileList.length - 1].originFileObj) {
        store.commit('setCaptureLoading', true);
        const files: File[] = fileList.value.map(file => file.originFileObj);
        for (const file of files) {
            const key = await store.dispatch('addCaptureFromFile', file);
            store.commit('setActiveKey', key);
        }
        store.commit('setCaptureLoading', false);
    }
    fileList.value = [];
};
</script>

<template>
    <a-upload v-model:fileList="fileList" accept=".png,.jpg" :beforeUpload="() => false" :multiple="true" :showUploadList="false" @change="handleClickOpen">
        <slot><a-button>Open</a-button></slot>
    </a-upload>
</template>

<style scoped></style>
