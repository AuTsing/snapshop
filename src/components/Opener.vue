<script setup lang="ts">
import { ref } from 'vue';

const refOpener = ref();

const handleClickOpen = () => {
    refOpener.value.click();
};

defineProps({
    handleChangeFile: { type: Function, required: true },
    acceptExt: { type: String, require: true },
});

defineExpose({
    handleClickOpen,
});
</script>

<template>
    <input ref="refOpener" type="file" multiple :accept="acceptExt" style="display: none" @change="it => handleChangeFile(it)" />
    <span @click="handleClickOpen"><slot></slot></span>
</template>

<style scoped></style>
