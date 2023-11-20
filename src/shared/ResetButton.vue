<script setup lang="ts">
defineProps({
    handleClick: { type: Function, required: true },
});
</script>

<template>
    <a-popconfirm title="确认恢复默认流程?" ok-text="确认" cancel-text="取消" @confirm="_ => handleClick()">
        <a-button danger>恢复默认</a-button>
    </a-popconfirm>
</template>

<style scoped></style>
