<script setup lang="ts">
defineProps({
    handleClick: { type: Function, required: true },
});
</script>

<template>
    <a-button @click="() => handleClick()">导入流程</a-button>
</template>

<style scoped></style>
