<template>
  <template v-if="!isBusy && item">
    <lMap
      :geo-json-features="mapGeoJsonFeatures"
      :zoom="10"
      :geo-filter="true"
      :control-layer="false"
      style="width: 100%; height: 100vh"
    />
  </template>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useCacheStore } from '../../stores/cache-store'
  import PostgSail from '../../services/api-client'
  import lMap from '../../components/maps/leafletMap.vue'

  const CacheStore = useCacheStore()
  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiData = reactive({ row: null })

  const item = computed(() => {
    return apiData.row
      ? {
          id: apiData.row.id,
          geoJson: apiData.row.geojson,
        }
      : {}
  })
  const mapGeoJsonFeatures = computed(() => {
    return item.value && item.value.geoJson && item.value.geoJson.features && Array.isArray(item.value.geoJson.features)
      ? item.value.geoJson.features
      : []
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    //const api = new PostgSail()
    const id = route.params.id
    try {
      //const response = await api.log_get(id)
      const response = await CacheStore.getAPI('log_get', id)
      apiData.row = response[0]
    } catch (e) {
      apiError.value = e
    } finally {
      isBusy.value = false
    }
  })
</script>

<style lang="scss"></style>
