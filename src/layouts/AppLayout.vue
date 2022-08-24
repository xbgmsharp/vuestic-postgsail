<template>
  <div class="app-layout">
    <navbar />
    <div class="app-layout__content">
      <div class="app-layout__page">
        <div class="layout fluid gutter--xl">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import Navbar from '../components/navbar/Navbar.vue'
</script>

<style lang="scss"></style>
