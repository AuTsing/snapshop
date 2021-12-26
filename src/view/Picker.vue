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
onKeyStroke(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    e => {
        e.preventDefault();
        const x = store.state.coordinate.x;
        const y = store.state.coordinate.y;
        if (store.getters.xyLegal(x, y)) {
            store.commit('addRecord', { x, y, c: store.getters.c, key: e.key });
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['q', 'Q'],
    e => {
        e.preventDefault();
        const x = store.state.coordinate.x;
        const y = store.state.coordinate.y;
        if (store.getters.xyLegal(x, y)) {
            store.commit('updateArea', { ...store.state.area, x1: x, y1: y });
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['e', 'E'],
    e => {
        e.preventDefault();
        const x = store.state.coordinate.x;
        const y = store.state.coordinate.y;
        if (store.getters.xyLegal(x, y)) {
            store.commit('updateArea', { ...store.state.area, x2: x, y2: y });
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['z', 'Z'],
    e => {
        e.preventDefault();
        store.commit('removeRecord');
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['x', 'X'],
    e => {
        e.preventDefault();
        store.commit('resetArea');
    },
    { target: refCanvas.value }
);
</script>

<template>
    <a-row class="picker" :wrap="false">
        <a-col class="canvas" flex="1 0 300px">
            <CanvasVue ref="refCanvas" />
        </a-col>
        <a-col flex="0 0 294px">
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
</style>
