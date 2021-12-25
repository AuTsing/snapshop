<script setup lang="ts">
import { useDevicePixelRatio } from '@vueuse/core';

import RealtimeInfoVue from './RealtimeInfo.vue';
import ZoomVue from './Zoom.vue';

const { pixelRatio } = useDevicePixelRatio();
</script>

<template>
    <div class="showcase">
        <ZoomVue />
        <RealtimeInfoVue />
        <div>{{ pixelRatio }}</div>
    </div>
</template>

<style scoped>
.showcase {
    background-color: darkslateblue;
    display: flex;
    height: 100%;
    width: 100%;
    padding-right: 20px;
    flex-direction: column;
    overflow-y: auto;
}
</style>
