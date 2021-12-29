<script setup lang="ts">
import RealtimeInfoVue from './RealtimeInfo.vue';
import ZoomVue from './Zoom.vue';
import RecordListVue from './RecordList.vue';
</script>

<template>
    <div class="showcase">
        <ZoomVue />
        <RealtimeInfoVue />
        <RecordListVue />
    </div>
</template>

<style scoped>
.showcase {
    background-color: #1f1f1f;
    display: flex;
    height: 100%;
    width: 100%;
    padding-right: 20px;
    flex-direction: column;
    overflow-y: overlay;
}
</style>
