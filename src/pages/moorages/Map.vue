<template>
  <div class="leaflet-map__full">
    <Map style="width: 100%; height: calc(100vh - 4.5rem)" :map-zoom="8" :moorage-map-id="0" />
  </div>
</template>

<script setup>
  import Map from '../../components/maps/leafletMapMoorages.vue'
</script>

<style lang="scss"></style>
