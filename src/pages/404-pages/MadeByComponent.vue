<template>
  <div class="made-by-component va-text-center pb-4">
    <span>
      ©2020-{{ year }}. Made by
      <a href="https://openplotter.cloud" class="va-link">openplotter</a>
    </span>
  </div>
</template>

<script setup>
  const year = new Date().getFullYear()
</script>

<style lang="scss">
  .made-by-component {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
</style>
