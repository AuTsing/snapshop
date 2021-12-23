<script setup lang="ts">
import PickerVue from './view/Picker.vue';
</script>

<template>
    <a-row class="screen" :wrap="false">
        <a-col class="nav" flex="0 0 50px">nav</a-col>
        <a-col flex="1 1 auto">
            <PickerVue />
        </a-col>
    </a-row>
</template>

<style>
body {
    padding: 0;
    margin: 0;
}
.screen {
    width: 100vw;
    height: 100vh;
}
.nav {
    background-color: darkred;
}
</style>
