<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from '../store';
import Jimp from 'jimp/browser/lib/jimp';

const defaultPreview =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAANSURBVBhXY2BgYGAAAAAFAAGKM+MAAAAAAElFTkSuQmCC';
const zoomRadius = 10;
const zoomSideLength = zoomRadius * 2 + 1;
const zoomDisplayRatio = 14;
const zoomSideLengthDisplay = zoomSideLength * zoomDisplayRatio;

const store = useStore();

const zoomCaptureBase64 = ref<string>('');
const x = computed(() => store.state.coordinate.x);
const y = computed(() => store.state.coordinate.y);

watch([x, y], async () => {
    const activeJimp = store.getters.activeJimp;
    const x0 = store.state.coordinate.x;
    const y0 = store.state.coordinate.y;
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
        const resizedJimp = jimp.resize(zoomSideLengthDisplay, zoomSideLengthDisplay, Jimp.RESIZE_NEAREST_NEIGHBOR);
        const base64 = await resizedJimp.getBase64Async(Jimp.MIME_PNG);
        zoomCaptureBase64.value = base64;
    } else {
        zoomCaptureBase64.value = defaultPreview;
    }
});
</script>

<template>
    <div class="zoom-container">
        <img
            class="zoom-cursor"
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAYAAAB5fY51AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIhSURBVHhe7dztCoIwAIZR6/7v2Zwf2dqGutooOKdAsN5/8mBBDQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8k9t6hMvG+VlnuvBce0A/c7DC45Jx/CR0AFWe4TkdrdCqlx1AL1F4DqO1xCqIdgA9JOEpRmuPVZDsAFrLhieJVhyrILsDaKkYnme00lgFxR1AKwfhKb4mWNS6r0f4ovnO6jZlSZiA35C/U3r7GJiJVn4H0FAanvx3VtO7ovPpDqCxODyFWG1eohXvADrYw3MQq80arX0H0MkSnpOx2kzREixq+cU81T4Jj39rAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgDrD8ACsgGSl3BVi9gAAAABJRU5ErkJggg=="
            alt=""
            :draggable="false"
        />
        <img class="zoom-cover" :src="''" alt="" :draggable="false" />
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
    width: 100%;
    height: 100%;
    z-index: 3;
}
.zoom-cover {
    position: absolute;
    z-index: 2;
}
.zoom-content {
    position: absolute;
    z-index: 1;
}
</style>
