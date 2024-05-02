<script setup lang="ts">
  import { PropType, computed, onMounted, ref } from 'vue'
  import { useVModel } from '@vueuse/core'
  import { Log, Pagination } from '../types'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../../services/api-client'
  import { useGlobalStore } from '../../../stores/global-store'
  import lMap from '../../../components/maps/leafletMap.vue'
  const { isLoggedIn, publicVessel } = useGlobalStore()
  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const logbook_geojson = ref([])

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    try {
      const api = new PostgSail()
      const response = await api.logs_geojson()
      if (Array.isArray(response)) {
        logbook_geojson.value = []
        logbook_geojson.value.push(...(response as []))
        console.log('Logs geojson list', logbook_geojson.value)
      } else {
        throw { response }
      }
    } catch (e) {
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', e)
        logbook_geojson.value = []
        //geojson.value.push(...logsData)
      }
    } finally {
      isBusy.value = false
    }
  })
</script>

<template>
  <div>
    <VaInnerLoading :loading="isBusy">
      <lMap
        v-if="logbook_geojson.length > 1"
        :geo-json-features="logbook_geojson"
        style="width: 100%; height: 80vh"
        :map-zoom="11"
        :geo-filter="true"
        :multigeojson="true"
      />
    </VaInnerLoading>
  </div>
</template>

<style lang="scss" scoped></style>
