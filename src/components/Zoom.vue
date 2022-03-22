<script setup lang="ts">
import { ref, watch, StyleValue } from 'vue';
import { storeToRefs } from 'pinia';
import { useCoordinateStore } from '../store/Coordinate';
import { useCaptureStore } from '../store/Capture';
import { useConfigurationStore } from '../store/Configuration';
import Jimp from 'jimp/browser/lib/jimp';
import { ICoordinateState } from '../store/Coordinate';

const defaultPreview =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC';
const zoomRadius = 10;
const zoomSideLength = zoomRadius * 2 + 1;
const zoomDisplayRatio = 14;
const zoomSideLengthDisplay = zoomSideLength * zoomDisplayRatio;

const coordinateStore = useCoordinateStore();
const captureStore = useCaptureStore();
const configurationStore = useConfigurationStore();

const zoomCaptureJimp = ref<Jimp | undefined>();
const zoomCaptureBase64 = ref<string>('');
const sameCoordinates = ref<ICoordinateState[]>([]);
const { x, y } = storeToRefs(coordinateStore);
const { showSameCoordinate } = storeToRefs(configurationStore);

const sameCoordinateStyle = (coor: ICoordinateState): StyleValue => {
    const left = coor.x * zoomDisplayRatio;
    const top = coor.y * zoomDisplayRatio;
    return {
        left: `${left}px`,
        top: `${top}px`,
    };
};

watch([x, y], async () => {
    const activeJimp = captureStore.activeJimp;
    const x0 = x.value;
    const y0 = y.value;
    if (activeJimp && x0 > -1 && y0 > -1) {
        const jimp = new Jimp(zoomSideLength, zoomSideLength, 0);
        for (let i = -zoomRadius; i <= zoomRadius; ++i) {
            for (let j = -zoomRadius; j <= zoomRadius; ++j) {
                const xx = i + x0;
                const yy = j + y0;
                if (xx >= 0 && xx < activeJimp.bitmap.width && yy >= 0 && yy < activeJimp.bitmap.height) {
                    jimp.setPixelColor(activeJimp.getPixelColor(xx, yy), i + 10, j + 10);
                }
            }
        }
        const unResizedJimp = jimp.clone();
        const resizedJimp = jimp.resize(zoomSideLengthDisplay, zoomSideLengthDisplay, Jimp.RESIZE_NEAREST_NEIGHBOR);
        const base64 = await resizedJimp.getBase64Async(Jimp.MIME_PNG);
        zoomCaptureJimp.value = unResizedJimp;
        zoomCaptureBase64.value = base64;
    } else {
        zoomCaptureJimp.value = undefined;
        zoomCaptureBase64.value = defaultPreview;
    }
});

watch(
    showSameCoordinate,
    () => {
        if (configurationStore.showSameCoordinate) {
            watch(zoomCaptureJimp, () => {
                const jimp = zoomCaptureJimp.value;
                if (!jimp) {
                    sameCoordinates.value = [];
                    return;
                }
                const c = jimp.getPixelColor(10, 10);
                const same: ICoordinateState[] = [];

                jimp.scan(0, 0, jimp.bitmap.width, jimp.bitmap.height, (sx, sy) => {
                    if (sx === 10 && sy === 10) {
                        return;
                    }
                    const sc = jimp.getPixelColor(sx, sy);
                    if (sc === c) {
                        same.push({ x: sx, y: sy });
                    }
                });
                sameCoordinates.value = same;
            });
        }
    },
    { immediate: true }
);
</script>

<template>
    <div class="zoom-container">
        <div class="zoom-cursor zoom-cursor-red"></div>
        <div v-for="coor in sameCoordinates" class="zoom-cover" :style="sameCoordinateStyle(coor)"></div>
        <img class="zoom-content" :src="zoomCaptureBase64" alt="" :draggable="false" />
    </div>
</template>

<style scoped>
.zoom-container {
    position: relative;
    height: 294px;
    width: 294px;
    flex: 0 0 auto;
}
.zoom-cursor {
    position: absolute;
    pointer-events: none;
    width: 14px;
    height: 14px;
    top: calc(50% - 7px);
    left: calc(50% - 7px);
}
.zoom-cursor-red {
    z-index: 3;
    border: solid 1px red;
    outline: solid 1px white;
}
.zoom-cover {
    position: absolute;
    z-index: 2;
    width: 14px;
    height: 14px;
    pointer-events: none;
    border: solid 1px rgb(127, 0, 0);
    outline: solid 1px white;
}
.zoom-content {
    position: absolute;
    z-index: 1;
}
</style>
