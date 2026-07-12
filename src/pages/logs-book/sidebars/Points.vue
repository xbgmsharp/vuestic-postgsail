<template>
  <div class="trip-points">
    <div class="flex items-center justify-between mb-2">
      <span class="font-medium">{{ $t('logs.points.title') }}</span>
      <va-button
        v-if="formattedPoints.length"
        preset="plain"
        size="small"
        icon="open_in_full"
        @click="showFullTable = true"
      >
        {{ $t('logs.points.fullTable') }}
      </va-button>
    </div>

    <template v-if="!formattedPoints.length">
      <p class="text-sm pa-2" style="color: var(--va-text-secondary)">
        {{ $t('logs.points.noRemarks') }}
      </p>
    </template>

    <va-collapse
      v-for="pt in formattedPoints"
      :key="pt.id"
      class="shadow-lg rounded-lg mb-2"
      :class="{ 'border border-primary': selectedId === pt.id }"
      @click="onSelect(pt)"
    >
      <template #header>
        <div class="flex justify-between items-center w-full pa-2">
          <span class="font-medium">{{ pt.time }}</span>
          <va-icon name="sticky_note_2" size="small" />
        </div>
      </template>

      <div class="grid grid-cols-2 gap-1 text-sm pa-2">
        <span><va-icon name="place" size="small" /> {{ pt.position }}</span>
        <span><va-icon name="air" size="small" /> {{ pt.wind_speed }}</span>
        <span><va-icon name="speed" size="small" /> {{ pt.speed }}</span>
        <span><va-icon name="compress" size="small" /> {{ pt.barometer }}</span>
        <span class="col-span-2"><va-icon name="straighten" size="small" /> {{ pt.distance }}</span>
      </div>
      <p class="pa-2 text-sm italic">{{ pt.notes }}</p>
    </va-collapse>

    <va-modal v-model="showFullTable" size="large" class="trip-points-modal" hide-default-actions>
      <div>
        <div class="flex justify-between items-center mb-4">
          <span class="font-medium text-lg">{{ $t('logs.points.title') }} {{ props.logName }}</span>
          <va-button preset="plain" icon="close" @click="showFullTable = false" />
        </div>

        <div style="flex: 1; overflow-y: auto">
          <va-data-table
            :items="formattedPoints"
            :columns="columns"
            sticky-header
            style="height: 100%"
            striped
            hoverable
          >
            <template #cell(notes)="{ value }">
              <div class="whitespace-normal break-words">{{ value }}</div>
            </template>
            <template #cell(position)="{ value }">
              <div class="whitespace-normal break-words flex flex-col leading-tight">
                <template v-for="(line, i) in value.split(',')" :key="i">
                  <span>{{ line.trim() }}</span>
                </template>
              </div>
            </template>
          </va-data-table>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <va-button preset="secondary" icon="fa-external-link" @click="printTable">
            {{ t('timeline.view_logbook') }}
          </va-button>
          <va-button preset="secondary" @click="showFullTable = false">
            {{ $t('vuestic.close') }}
          </va-button>
        </div>
      </div>
    </va-modal>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import L from 'leaflet'
  import { useGlobalStore } from '../../../stores/global-store'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import { speedFormatKnots } from '../../../utils/speedFormatter.js'
  import { pascalToHectoPascal } from '../../../utils/presureFormatter.js'
  import { distanceFormat } from '../../../utils/distanceFormatter.js'
  import { decimalToDMS } from '../../../utils/dms.js'
  import type { Feature, Point } from 'geojson'

  const router = useRouter()
  const { isLoggedIn, publicVessel } = useGlobalStore()

  const { t } = useI18n()
  const props = defineProps<{
    points: Feature<Point>[]
    loading?: boolean
    logId: string | number
    logName: string
    selectedId?: string | number
  }>()
  const emit = defineEmits<{ (e: 'select-point', pt: Feature<Point>): void }>()

  const columns = [
    { key: 'time', label: t('logs.log.time') },
    { key: 'status', label: t('logs.log.status') },
    { key: 'position', label: t('logs.log.position') },
    { key: 'course', label: t('logs.log.course') },
    { key: 'wind_speed', label: t('logs.log.wind_speed') },
    { key: 'speed', label: t('logs.log.speed') },
    { key: 'barometer', label: t('logs.log.barometer') },
    { key: 'distance', label: t('logs.log.distance_nm') },
    { key: 'notes', label: t('logs.log.note') },
  ]

  const showFullTable = ref(false)

  // one pass over the full ordered point list — O(n), not O(n²)
  function computeCumulativeDistances(points: Feature<Point>[]): number[] {
    const distances: number[] = [0]
    for (let i = 1; i < points.length; i++) {
      const [lonA, latA] = points[i - 1].geometry.coordinates as [number, number]
      const [lonB, latB] = points[i].geometry.coordinates as [number, number]
      distances.push(distances[i - 1] + L.latLng(latA, lonA).distanceTo(L.latLng(latB, lonB)))
    }
    return distances
  }

  // single source of truth: format once, used by both the card list and the full-table modal
  function formatPoint(pt: Feature<Point>, distanceMeters: number) {
    const p = pt.properties!
    const [lon, lat] = pt.geometry.coordinates as [number, number]
    return {
      id: p.time,
      raw: pt,
      time: dateFormatUTC(p.time),
      status: p.status ?? '',
      position: decimalToDMS(lat, lon),
      course: p.courseovergroundtrue ?? '',
      wind_speed: speedFormatKnots(p.truewindspeed),
      speed: speedFormatKnots(p.speedoverground),
      barometer: pascalToHectoPascal(p.outsidepressure),
      distance: distanceFormat(distanceMeters / 1852),
      notes: p.notes,
    }
  }

  const formattedPoints = computed(() => {
    const allPoints = props.points.filter((f) => f.geometry.type === 'Point')
    const cumulativeMeters = computeCumulativeDistances(allPoints)

    return allPoints
      .map((pt, i) => ({ pt, distance_m: cumulativeMeters[i] }))
      .filter(({ pt }) => !!pt.properties?.notes && pt.properties.notes.trim().length > 0)
      .map(({ pt, distance_m }) => formatPoint(pt, distance_m))
  })

  function onSelect(pt: ReturnType<typeof formatPoint>) {
    emit('select-point', pt.raw)
  }

  function printTable() {
    const route = router.resolve(
      isLoggedIn
        ? { name: 'logslapse', query: { start_log: props.logId, end_log: props.logId } }
        : {
            name: 'logslapse',
            params: { boat: publicVessel },
            query: { start_log: props.logId, end_log: props.logId },
          },
    )
    window.open(route.href, '_blank')
  }
</script>
