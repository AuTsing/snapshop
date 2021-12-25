<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from '../store';
import { onKeyStroke } from '@vueuse/core';

import CanvasVue from '../components/Canvas.vue';
import ShowcaseVue from '../components/Showcase.vue';

const store = useStore();

const refCanvas = ref();

onKeyStroke(
    ['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft', 's', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'],
    e => {
        e.preventDefault();
        let x = store.state.coordinate.x;
        let y = store.state.coordinate.y;
        switch (e.key) {
            case 'w':
            case 'W':
            case 'ArrowUp':
                y--;
                break;
            case 'a':
            case 'A':
            case 'ArrowLeft':
                x--;
                break;
            case 's':
            case 'S':
            case 'ArrowDown':
                y++;
                break;
            case 'd':
            case 'D':
            case 'ArrowRight':
                x++;
                break;
            default:
                break;
        }
        if (store.getters.xyLegal(x, y)) {
            store.commit('updateCoordinate', { x, y });
        }
    },
    { target: refCanvas.value }
);
</script>

<template>
    <a-row class="picker" :wrap="false">
        <a-col class="canvas" flex="1 0 300px">
            <CanvasVue ref="refCanvas" />
        </a-col>
        <a-col class="info" flex="0 0 314px">
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
