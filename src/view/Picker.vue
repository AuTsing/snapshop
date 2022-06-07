<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useCoordinateStore } from '../store/Coordinate';
import { useRecordStore } from '../store/Record';
import { useAreaStore } from '../store/Area';
import { useCodeStore } from '../store/Code';
import { useConfigurationStore } from '../store/Configuration';
import { useLoadCaptureApiStore } from '../store/LoadCaptureApi';
import { onKeyStroke } from '@vueuse/core';
import { useControlCv } from '../plugins/ControlCv';
import { message } from 'ant-design-vue';

import CanvasVue from '../components/Canvas.vue';
import ShowcaseVue from '../components/Showcase.vue';

const coordinateStore = useCoordinateStore();
const recordStore = useRecordStore();
const areaStore = useAreaStore();
const codeStore = useCodeStore();
const configurationStore = useConfigurationStore();
const loadCaptureApiStore = useLoadCaptureApiStore();
const controlCv = useControlCv();

const refCanvas = ref();

onKeyStroke(
    ['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft', 's', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'],
    e => {
        e.preventDefault();
        let x = coordinateStore.x;
        let y = coordinateStore.y;
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
        if (coordinateStore.xyLegal(x, y)) {
            coordinateStore.updateCoordinate(x, y);
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    e => {
        e.preventDefault();
        const x = coordinateStore.x;
        const y = coordinateStore.y;
        if (coordinateStore.xyLegal(x, y)) {
            recordStore.addRecord(x, y, coordinateStore.c(), coordinateStore.cNative, e.key);
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['q', 'Q'],
    e => {
        e.preventDefault();
        const x = coordinateStore.x;
        const y = coordinateStore.y;
        if (coordinateStore.xyLegal(x, y)) {
            areaStore.updateArea(x, y, areaStore.x2, areaStore.y2);
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['e', 'E'],
    e => {
        e.preventDefault();
        const x = coordinateStore.x;
        const y = coordinateStore.y;
        if (coordinateStore.xyLegal(x, y)) {
            areaStore.updateArea(areaStore.x1, areaStore.y1, x, y);
        }
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['z', 'Z'],
    e => {
        e.preventDefault();
        recordStore.removeRecord();
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['x', 'X'],
    e => {
        e.preventDefault();
        areaStore.resetArea();
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['c', 'C'],
    e => {
        e.preventDefault();
        recordStore.refetchRecord();
    },
    { target: refCanvas.value }
);
onKeyStroke(
    ['f', 'F', 'g', 'G', 'h', 'H', 'v', 'V', 'b', 'B'],
    e => {
        e.preventDefault();
        let code: string = '';
        switch (e.key) {
            case 'f':
            case 'F':
                code = codeStore.generate(1);
                break;
            case 'g':
            case 'G':
                code = codeStore.generate(2);
                break;
            case 'h':
            case 'H':
                code = codeStore.generate(3);
                break;
            case 'v':
            case 'V':
                code = codeStore.generate(4);
                break;
            case 'b':
            case 'B':
                code = codeStore.generate(5);
                break;
            default:
                break;
        }
        controlCv.ctrlC(code);
    },
    { target: refCanvas.value }
);
onKeyStroke(['r', 'R'], () => refCanvas.value.handleClickLoad(), { target: refCanvas.value });
onKeyStroke(['t', 'T'], () => refCanvas.value.handleClickOpen(), { target: refCanvas.value });
onKeyStroke(
    ['n', 'N'],
    async () => {
        configurationStore.useNextLoadCaptureMode();
        message.info(`远程加载图片模式已切换至: ${configurationStore.loadCaptureMode}`);
    },
    { target: refCanvas.value }
);

onMounted(() => {
    if (!loadCaptureApiStore.loadedApis && !loadCaptureApiStore.loadingApis) {
        loadCaptureApiStore.loadApis();
    }
});
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
