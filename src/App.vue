<script setup lang="ts">
import NavbarVue from './components/Navbar.vue';
</script>

<template>
    <div class="page">
        <div class="header-and-content-container">
            <NavbarVue></NavbarVue>
        </div>
    </div>
</template>

<style>
body {
    padding: 0;
}
.page {
    display: flex;
    width: 100vw;
    height: 100vh;
}
.header-and-content-container {
    width: calc(100vw - 310px);
    height: 100vh;
    display: flex;
    flex-direction: column;
}
</style>
