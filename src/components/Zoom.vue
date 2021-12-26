<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from '../store';
import { promiseTimeout } from '@vueuse/core';

const store = useStore();

const zoomCaptureBase64 = ref<string>('');
const zoomCaptureBase64Promise = computed(() => store.getters.zoomCaptureBase64);

watch(zoomCaptureBase64Promise, async () => {
    zoomCaptureBase64.value = await zoomCaptureBase64Promise.value;
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
