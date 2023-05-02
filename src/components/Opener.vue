<script setup lang="ts">
import { ref } from 'vue';
import { useCaptureStore } from '../store/Capture';

const captureStore = useCaptureStore();

const refOpener = ref();

const handleChangeFile = async (e: any) => {
    const files = Array.from(e.target.files as FileList);
    captureStore.loading = true;
    for (const file of files) {
        const key = await captureStore.addCaptureFromFile(file);
        captureStore.activeKey = key;
    }
    e.target.value = null;
    captureStore.loading = false;
};
const handleClickOpen = () => {
    refOpener.value.click();
};

defineExpose({
    handleClickOpen,
});
</script>

<template>
    <input ref="refOpener" type="file" multiple accept=".png,.jpg" style="display: none" @change="handleChangeFile" />
    <span @click="handleClickOpen"><slot></slot></span>
</template>

<style scoped></style>
