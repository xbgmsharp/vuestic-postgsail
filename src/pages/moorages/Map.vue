<template>
  <Map style="width: 100%; height: 80vh" :map-zoom="8" :moorage-map-id="0" />
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { setAppTitle } from '../../utils/app.js'
  import Map from '../../components/maps/leafletMapMoorages.vue'

  const { t } = useI18n()

  onMounted(async () => {
    const title = t('moorages.map.title')
    document.title = setAppTitle(title)
  })
</script>

<style lang="scss"></style>
