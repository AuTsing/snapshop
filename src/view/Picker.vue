<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../store';

import CanvasVue from '../components/Canvas.vue';
import ShowcaseVue from '../components/Showcase.vue';

const store = useStore();

const x = computed(() => store.state.coordinate.x);
const y = computed(() => store.state.coordinate.y);
</script>

<template>
    <a-row class="picker" :wrap="false">
        <a-col class="canvas" flex="1 0 300px">
            <CanvasVue />
        </a-col>
        <a-col class="info" flex="0 0 300px">
            <ShowcaseVue />
        </a-col>
    </a-row>
</template>

<style scoped>
.picker {
    height: 100%;
}
.canvas {
    width: 0;
    height: 100%;
}
.info {
    background: blue;
}
</style>
