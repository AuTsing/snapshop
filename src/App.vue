<script setup lang="ts">
import NavbarVue from './components/Navbar.vue';
</script>

<template>
    <a-row class="screen" :wrap="false">
        <a-col>
            <NavbarVue />
        </a-col>
        <a-col flex="1 1 auto">
            <div :style="{ height: '100%', overflowY: 'auto' }">
                <router-view></router-view>
            </div>
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
:root {
    --vscode-editor-background: #1e1e1e;
    --vscode-scrollbarSlider-background: rgba(121, 121, 121, 0.4);
    --vscode-scrollbarSlider-hoverBackground: rgba(100, 100, 100, 0.7);
    --vscode-scrollbarSlider-activeBackground: rgba(191, 191, 191, 0.4);
}
::-webkit-scrollbar {
    width: 10px;
    height: 10px;
}
::-webkit-scrollbar-corner {
    background-color: var(--vscode-editor-background);
}
::-webkit-scrollbar-thumb {
    background-color: var(--vscode-scrollbarSlider-background);
}
::-webkit-scrollbar-thumb:hover {
    background-color: var(--vscode-scrollbarSlider-hoverBackground);
}
::-webkit-scrollbar-thumb:active {
    background-color: var(--vscode-scrollbarSlider-activeBackground);
}
</style>
