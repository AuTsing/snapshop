<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';

const store = useStore();

const refOpener = ref();

const handleChangeFile = async (fileList: FileList) => {
    const files = Array.from(fileList);
    store.commit('setCaptureLoading', true);
    for (const file of files) {
        const key = await store.dispatch('addCaptureFromFile', file);
        store.commit('setActiveKey', key);
    }
    store.commit('setCaptureLoading', false);
};
const handleClickOpen = () => {
    refOpener.value.click();
};

defineExpose({
    handleClickOpen,
});
</script>

<template>
    <input ref="refOpener" type="file" multiple accept=".png,.jpg" style="display: none" @change="(e:any) => handleChangeFile(e.target.files)" />
    <span @click="handleClickOpen"><slot></slot></span>
</template>

<style scoped></style>
