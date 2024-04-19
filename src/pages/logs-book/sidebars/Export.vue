<script setup lang="ts">
  import { PropType, computed, ref } from 'vue'
  import { Trip, FormData } from '../types'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import { asBusy, handleExport } from '../../../utils/handleExports'
  import { durationFormatHours } from '../../../utils/dateFormatter.js'
  import { distanceFormat } from '../../../utils/distanceFormatter.js'

  const { publicVessel, instagram, website } = useGlobalStore()
  const { t } = useI18n()
  const route = useRoute()
  const props = defineProps({
    logbook: {
      type: Object as PropType<Trip>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<FormData>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'save', log: Trip): void
    (event: 'delete', log: Trip): void
  }>()

  const isBusy = ref(false)
  const apiError = ref(null)
  // handle Exports
  const runBusy = (fn: any, ...args: any[]) => asBusy(isBusy, apiError, fn, { ...args }),
    handleGPX = (id: number) => handleExport_common('gpx', id),
    handleKML = (id: number) => handleExport_common('kml', id),
    handleGeoJSON = (id: number) => handleExport_common('geojson', id),
    handleExport_common = (format: string, id: number) => runBusy(handleExport, format, 'log', { _id: id }, `log_${id}`)
</script>

<template>
  <div>
    <!-- export section -->
    <div class="">
      <div class="">
        <va-icon name="gpx" :size="44" @click="handleGPX(logbook.id)" />
        <va-icon name="geojson" :size="44" @click="handleGeoJSON(logbook.id)" />
        <va-icon name="kml" :size="44" @click="handleKML(logbook.id)" />
      </div>
    </div>
    <!-- sharing section -->
    <!-- EMail, Facebook, more? -->
    <div class="">
      <div class="">
        <a
          :href="`https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fiot.openplotter.cloud%2F${publicVessel}%2Flog%2F${logbook.id}&t=${publicVessel}'s Trip From ${formData.name}`"
          target="_blank"
          ><va-icon name="facebook" :size="44"
        /></a>
        <template v-if="instagram">
          <a :href="`https://www.instagram.com/${instagram}/`" target="_blank">
            <va-icon name="instagram" :size="44"
          /></a>
        </template>
        <a
          :href="`https://twitter.com/intent/tweet?text=From ${formData.name}&url=https%3A%2F%2Fiot.openplotter.cloud/${publicVessel}/log/${logbook.id}`"
          target="_blank"
        >
          <va-icon name="x-twitter" :size="44"
        /></a>
        <a
          :href="
            `mailto:?subject=${publicVessel}'s Trip From ${formData.name}&body=Marine logbook entry for the ` +
            String(distanceFormat(logbook.distance)) +
            ` trip from ${logbook.from} to ${logbook.to}, lasting ` +
            String(durationFormatHours(logbook.duration)) +
            `hours.%0D%0A%0D%0Ahttps://iot.openplotter.cloud/${publicVessel}/log/${logbook.id}`
          "
          target="_blank"
          ><va-icon name="envelope" :size="44"
        /></a>
        <template v-if="website">
          <a :href="website" target="_blank"><va-icon name="envelope" :size="44" /></a>
        </template>
      </div>
    </div>
  </div>
</template>
