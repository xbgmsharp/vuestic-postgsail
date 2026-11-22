<template>
  <div class="p-4 relative">
    <!-- Date-range picker — hidden when opened via log-id link, hidden on print -->
    <div v-if="!isLogIdMode" class="print:hidden mb-6">
      <div class="flex flex-wrap gap-3 items-center">
        <va-date-input v-model="dateRange" mode="range" class="w-72" @update:model-value="onRangeChange" />
        <va-chip
          v-for="preset in presets"
          :key="preset.key"
          size="small"
          :outline="activePreset !== preset.key"
          class="cursor-pointer"
          :color="activePreset === preset.key ? 'primary' : 'secondary'"
          @click="applyPreset(preset)"
          >{{ preset.label }}</va-chip
        >
      </div>
    </div>

    <!-- Print button -->
    <button
      class="fixed top-4 right-4 bg-gray-300 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg print:hidden"
      :title="$t('logs.book.print')"
      @click="printLogbook"
    >
      🖨️
    </button>

    <va-alert v-if="apiError" color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>

    <va-inner-loading :loading="isBusy">
      <div v-if="days.length === 0 && !isBusy" class="text-center py-16 va-text-secondary">
        {{ $t('nodata.nodata') }}
      </div>
      <div v-else-if="days.length" id="logbook-print">
        <h1 class="text-center text-2xl font-bold mb-1">{{ vesselName }}</h1>
        <h2 class="text-center text-lg text-gray-600 mb-6">{{ rangeLabel }}</h2>

        <!-- Composite route map for the WHOLE range — an overview image
             covering every trip from start_log to end_log. Each trip below
             also gets its own map (log_<vesselId>_<id>.png) so multi-leg
             days (harbor -> beach -> harbor) stay visually distinct instead
             of overlapping into one shape here. In date-range mode there's
             no log id in the URL, so this range is derived from the fetched
             trips' min/max id (see mapImageUrl). -->
        <va-card v-if="mapImageUrl" class="shadow-md rounded-lg mb-6 break-inside-avoid">
          <va-card-content>
            <img
              v-if="!mapImageError"
              :src="mapImageUrl"
              alt="Trip route map"
              class="w-full rounded"
              style="max-height: 400px; object-fit: contain"
              @error="mapImageError = true"
            />
            <div v-else class="text-sm text-gray-500 text-center py-6">
              {{ $t('logs.book.mapUnavailable') }}
            </div>
          </va-card-content>
        </va-card>

        <!-- Range summary -->
        <va-card class="shadow-md rounded-lg mb-8 break-inside-avoid">
          <va-card-content>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span class="text-gray-500 block">{{ $t('logs.book.days') }}</span>
                {{ days.length }}
              </div>
              <div>
                <span class="text-gray-500 block">{{ $t('logs.book.trips') }}</span>
                {{ trips.length }}
              </div>
              <div>
                <span class="text-gray-500 block">{{ $t('logs.book.stays') }}</span>
                {{ stays.length }}
              </div>
              <div>
                <span class="text-gray-500 block">{{ $t('logs.log.distance') }}</span>
                {{ totalDistance.toFixed(1) }} nm
              </div>
            </div>
          </va-card-content>
        </va-card>

        <!-- One section per day -->
        <section
          v-for="(day, dayIdx) in days"
          :key="day.date"
          class="day-section mb-10"
          :class="{ 'print-page-break': dayIdx > 0 }"
        >
          <h2 class="text-xl font-semibold border-b-2 pb-2 mb-4" :style="{ borderColor: 'var(--va-primary)' }">
            {{ day.dateLabel }}
          </h2>

          <!-- Daily narrative note — placeholder until daily_notes/daily_note_fn exists.
               Once the backend endpoint is in, fetch a map of date -> note alongside
               trips/stays in fetchData() and swap dailyNoteFor(day.date) below for
               the real lookup. Left visible-but-empty-safe so the template doesn't
               need to change when the data source lands. -->
          <va-card v-if="dailyNoteFor(day.date)" class="shadow-md rounded-lg mb-4 break-inside-avoid">
            <va-card-content>
              <p class="text-base whitespace-pre-line italic">{{ dailyNoteFor(day.date) }}</p>
            </va-card-content>
          </va-card>

          <!-- Chronological events for the day: trips and stays interleaved -->
          <template v-for="event in day.events" :key="`${event.kind}-${event.id}-${event.sortTime}`">
            <!-- Trip event -->
            <div v-if="event.kind === 'trip'" class="mb-6">
              <h3 class="text-base font-medium mb-2">
                {{ event.fromTime }} → {{ event.toTime }} · {{ event.from }} → {{ event.to }}
              </h3>

              <va-card v-if="event.mapImageUrl" class="shadow-md rounded-lg mb-3 break-inside-avoid">
                <va-card-content>
                  <img
                    v-if="!mapImageErrors[event.id]"
                    :src="event.mapImageUrl"
                    alt="Trip route map"
                    class="w-full rounded"
                    style="max-height: 280px; object-fit: contain"
                    @error="mapImageErrors[event.id] = true"
                  />
                  <div v-else class="text-sm text-gray-500 text-center py-6">
                    {{ $t('logs.book.mapUnavailable') }}
                  </div>
                </va-card-content>
              </va-card>

              <va-card class="shadow-md rounded-lg mb-3 break-inside-avoid">
                <va-card-content>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span class="text-gray-500 block">{{ $t('logs.log.distance') }}</span
                      >{{ event.distance }}
                    </div>
                    <div>
                      <span class="text-gray-500 block">{{ $t('logs.log.duration') }}</span
                      >{{ event.duration }}
                    </div>
                    <div>
                      <span class="text-gray-500 block">{{ $t('logs.log.avg') }}</span
                      >{{ event.avg_speed }}
                    </div>
                    <div>
                      <span class="text-gray-500 block">{{ $t('logs.log.max') }}</span
                      >{{ event.max_speed }}
                    </div>
                  </div>

                  <div v-if="event.tags.length" class="mt-3">
                    <va-chip v-for="tag in event.tags" :key="tag" size="small" class="mr-1 mb-1" outline>{{
                      tag
                    }}</va-chip>
                  </div>

                  <p v-if="event.notes" class="mt-3 text-sm whitespace-pre-line">{{ event.notes }}</p>
                </va-card-content>
              </va-card>

              <va-card v-if="event.trackNotes.length" class="shadow-md rounded-lg mb-3 break-inside-avoid">
                <va-card-title>{{ $t('logs.book.trackNotes') }}</va-card-title>
                <va-card-content>
                  <ul class="text-sm space-y-2">
                    <li v-for="(note, idx) in event.trackNotes" :key="idx" class="border-b pb-2 last:border-b-0">
                      <span class="text-gray-500 mr-2">{{ note.time }}</span>
                      <span class="whitespace-pre-line">{{ note.text }}</span>
                    </li>
                  </ul>
                </va-card-content>
              </va-card>

              <va-card v-if="event.hasAnyMetrics" class="shadow-md rounded-lg mb-3 break-inside-avoid">
                <va-card-title>{{ $t('logs.log.metrics') }}</va-card-title>
                <va-card-content>
                  <div v-if="event.sailMotorSplit" class="text-sm mb-3">
                    <div class="flex justify-between mb-1">
                      <span class="text-gray-600 dark:text-gray-400">⛵ {{ $t('logs.log.sailing') }}</span>
                      <span class="font-mono"
                        >{{ event.sailMotorSplit.sail.distance }} nm · {{ event.sailMotorSplit.sail.duration }}</span
                      >
                    </div>
                    <div class="flex justify-between mb-1">
                      <span class="text-gray-600 dark:text-gray-400">🛥️ {{ $t('logs.log.motoring') }}</span>
                      <span class="font-mono"
                        >{{ event.sailMotorSplit.motor.distance }} nm · {{ event.sailMotorSplit.motor.duration }}</span
                      >
                    </div>
                    <div
                      class="h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex mt-2 text-white text-xs font-mono"
                    >
                      <div
                        v-if="event.sailMotorSplit.sailPct > 0"
                        class="h-full flex items-center justify-center gap-1"
                        :style="{ width: event.sailMotorSplit.sailPct + '%', backgroundColor: 'var(--va-primary)' }"
                      >
                        <span v-if="event.sailMotorSplit.sailPct >= 12"
                          >⛵ {{ event.sailMotorSplit.sailPct.toFixed(0) }}%</span
                        >
                      </div>
                      <div
                        v-if="event.sailMotorSplit.motorPct > 0"
                        class="h-full flex items-center justify-center gap-1"
                        :style="{ width: event.sailMotorSplit.motorPct + '%', backgroundColor: 'var(--va-warning)' }"
                      >
                        <span v-if="event.sailMotorSplit.motorPct >= 12"
                          >🛥️ {{ event.sailMotorSplit.motorPct.toFixed(0) }}%</span
                        >
                      </div>
                    </div>
                  </div>

                  <dl
                    v-if="event.engineHours.length || event.propulsionMetrics.length"
                    class="text-sm divide-y divide-gray-100 dark:divide-gray-700"
                  >
                    <div v-for="engine in event.engineHours" :key="engine.name" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ engine.name }} {{ $t('logs.log.run_time') }}</dt>
                      <dd class="font-mono text-right">{{ engine.duration }}</dd>
                    </div>
                    <div v-for="metric in event.propulsionMetrics" :key="metric.key" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ metric.label }}</dt>
                      <dd class="font-mono text-right">{{ metric.value }}</dd>
                    </div>
                  </dl>

                  <dl v-if="event.fuelMetrics" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    <div v-if="event.fuelMetrics.consumed" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ $t('logs.log.fuel_consumed') }}</dt>
                      <dd class="font-mono text-right">{{ event.fuelMetrics.consumed }} L</dd>
                    </div>
                    <div v-if="event.fuelMetrics.avgLph" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ $t('logs.log.fuel_avg_rate') }}</dt>
                      <dd class="font-mono text-right">{{ event.fuelMetrics.avgLph }} L/h</dd>
                    </div>
                    <div v-if="event.fuelMetrics.avgLpnm" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ $t('logs.log.fuel_avg_consumption') }}</dt>
                      <dd class="font-mono text-right">{{ event.fuelMetrics.avgLpnm }} L/nm</dd>
                    </div>
                  </dl>

                  <dl v-if="event.tankMetrics.length" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    <div v-for="tank in event.tankMetrics" :key="tank.key" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ tank.label }}</dt>
                      <dd class="font-mono text-right" :class="{ 'text-warning': tank.value < 0 }">
                        {{ tank.value > 0 ? '+' : '' }}{{ tank.value.toFixed(1) }}%
                      </dd>
                    </div>
                  </dl>

                  <dl v-if="event.navigationLog" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
                    <div class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ $t('logs.log.total_log') }}</dt>
                      <dd class="font-mono text-right">{{ event.navigationLog }} nm</dd>
                    </div>
                  </dl>

                  <dl
                    v-if="event.unhandledMetrics.length"
                    class="text-sm divide-y divide-gray-100 dark:divide-gray-700"
                  >
                    <div v-for="{ key, value } in event.unhandledMetrics" :key="key" class="flex justify-between py-1">
                      <dt class="text-gray-600 dark:text-gray-400">{{ formatMetricKey(key) }}</dt>
                      <dd class="font-mono text-right">{{ formatMetricValue(key, value) }}</dd>
                    </div>
                  </dl>
                </va-card-content>
              </va-card>

              <va-card
                v-if="event.seaState || event.cloudCoverage || event.visibility"
                class="shadow-md rounded-lg break-inside-avoid"
              >
                <va-card-title>{{ $t('logs.log.observations') }}</va-card-title>
                <va-card-content>
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div v-if="event.seaState">
                      <span class="text-gray-500 block">{{ $t('logs.log.sea_state') }}</span
                      >{{ event.seaState }}
                    </div>
                    <div v-if="event.cloudCoverage">
                      <span class="text-gray-500 block">{{ $t('logs.log.cloud_coverage') }}</span
                      >{{ event.cloudCoverage }}
                    </div>
                    <div v-if="event.visibility">
                      <span class="text-gray-500 block">{{ $t('logs.log.visibility') }}</span
                      >{{ event.visibility }}
                    </div>
                  </div>
                </va-card-content>
              </va-card>
            </div>

            <!-- Stay event — field names match staylapse.vue's real notes_history() row shape -->
            <va-card
              v-else
              class="shadow-sm rounded-lg mb-6 break-inside-avoid"
              style="background: var(--va-background-secondary)"
            >
              <va-card-title>
                <div class="flex items-center gap-2">
                  <template v-if="event.stayCode !== 4">
                    <img :src="event.iconUrl" alt="" class="inline-block h-4 w-4 align-middle" />
                  </template>
                  <template v-else>📍</template>
                  <span>{{ event.name }}</span>
                </div>
              </va-card-title>
              <va-card-content>
                <div class="text-sm text-gray-500 mb-1">{{ event.arrivedLabel }}</div>
                <div class="text-sm text-blue-500 mb-2">{{ event.dms }}</div>
                <p v-if="event.notes" class="text-sm whitespace-pre-line mb-2">{{ event.notes }}</p>
                <p v-if="event.moorageNotes" class="text-sm whitespace-pre-line mb-2 text-gray-600">
                  {{ event.moorageNotes }}
                </p>
                <img
                  v-if="event.imageUrl"
                  :src="event.imageUrl"
                  alt="Stay photo"
                  class="max-w-full h-auto mx-auto rounded-lg shadow-md print:max-h-[400px]"
                />
              </va-card-content>
            </va-card>
          </template>
        </section>
      </div>
    </va-inner-loading>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useVesselStore } from '../../stores/vessel-store'
  import { storeToRefs } from 'pinia'
  import { dateFormatUTC, durationFormatHours, durationI18nHours } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { decimalToDMS } from '../../utils/dms'
  import PostgSail from '../../services/api-client'
  import { deriveLogMetrics, formatMetricKey, formatMetricValue } from './useLogbookMetrics.js'

  const { t } = useI18n()
  const route = useRoute()

  const api = new PostgSail()
  const VesselStore = useVesselStore()
  const { vesselName } = storeToRefs(VesselStore)

  const isBusy = ref(false)
  const apiError = ref(null)
  const rawLogs = ref([])
  const rawStays = ref([])
  const dailyNotes = ref({})
  const mapImageError = ref(false)
  const mapImageErrors = ref({})

  // ── Date range state (mirrors Stats page behaviour) ─────────────────────────
  // URL contracts:
  //   ?start_log=7953&end_log=7953          → log-id mode (no picker shown)
  //   ?start_date=2026-07-06&end_date=...   → date mode (picker pre-populated)
  //   (no params)                            → date mode, default last 30 days
  const toISO = (d) => {
    const y = d.getFullYear(),
      m = String(d.getMonth() + 1).padStart(2, '0'),
      day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const q = route.query
  const startLogId = ref(q.start_log || null)
  const endLogId = ref(q.end_log || null)
  const mapType = q.map_type || 'Satellite'

  const isLogIdMode = computed(() => !!(startLogId.value && endLogId.value))

  // Date range for the picker (null means not yet chosen; we init from URL or last-30-days)
  const now = new Date()
  const daysAgo = (n) => {
    const d = new Date(now)
    d.setDate(d.getDate() - n)
    return d
  }

  const dateRange = ref(
    isLogIdMode.value
      ? null
      : q.start_date && q.end_date
      ? { start: new Date(q.start_date), end: new Date(q.end_date) }
      : { start: daysAgo(30), end: now },
  )

  const activePreset = ref(q.start_date ? null : 'last_30')

  const presets = [
    { key: 'this_month', label: 'This Month', start: new Date(now.getFullYear(), now.getMonth(), 1), end: now },
    {
      key: 'last_month',
      label: 'Last Month',
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0),
    },
    { key: 'last_30', label: 'Last 30 days', start: daysAgo(30), end: now },
    { key: 'last_90', label: 'Last 90 days', start: daysAgo(90), end: now },
    { key: 'this_year', label: 'This Year', start: new Date(now.getFullYear(), 0, 1), end: now },
    { key: 'last_12m', label: 'Last 12 months', start: daysAgo(365), end: now },
  ]

  function applyPreset(preset) {
    activePreset.value = preset.key
    dateRange.value = { start: preset.start, end: preset.end }
    fetchData()
  }

  function onRangeChange() {
    activePreset.value = null
    fetchData()
  }

  // ── Data fetching ────────────────────────────────────────────────────────────
  function buildFilterQuery() {
    if (isLogIdMode.value) {
      return `id=gte.${startLogId.value}&id=lte.${endLogId.value}`
    }
    const dr = dateRange.value
    if (dr?.start && dr?.end) {
      return `started=gte.${toISO(dr.start)}&ended=lte.${toISO(dr.end)}`
    }
    return null
  }

  function computeDateWindow(logs) {
    const dr = dateRange.value
    if (!isLogIdMode.value && dr?.start && dr?.end) {
      return { start: toISO(dr.start), end: toISO(dr.end) }
    }
    if (logs.length) {
      const starts = logs
        .map((l) => l.started)
        .filter(Boolean)
        .sort()
      const ends = logs
        .map((l) => l.ended)
        .filter(Boolean)
        .sort()
      return { start: starts[0] ?? null, end: ends[ends.length - 1] ?? null }
    }
    return { start: null, end: null }
  }

  function withinWindow(iso, window) {
    if (!iso) return false
    if (window.start && iso < window.start) return false
    if (window.end && iso > window.end) return false
    return true
  }

  async function fetchData() {
    const filterQuery = buildFilterQuery()
    if (!filterQuery) return
    isBusy.value = true
    apiError.value = null
    try {
      const logs = await api.logs_range(filterQuery)
      rawLogs.value = Array.isArray(logs) ? logs : []

      const allStays = await api.notes_history()
      const window = computeDateWindow(rawLogs.value)
      rawStays.value = Array.isArray(allStays) ? allStays.filter((row) => withinWindow(row.arrived, window)) : []
    } catch (e) {
      apiError.value = e?.message ?? e
    } finally {
      isBusy.value = false
    }
  }

  function dayKeyFromISO(iso) {
    // Assumes backend timestamps are ISO 8601 UTC strings (e.g. "2026-07-10T14:32:00Z").
    // If the row uses a different field/format, adjust here — everything else
    // buckets off this single function.
    return iso ? String(iso).slice(0, 10) : 'unknown'
  }

  function formatDayLabel(dayKey) {
    if (dayKey === 'unknown') return t('logs.book.unknownDate')
    const d = new Date(dayKey + 'T00:00:00Z')
    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
  }

  // ---------------------------------------------------------------------------
  // Trip row -> display item
  // ---------------------------------------------------------------------------
  function mapTripRow(row) {
    const derived = deriveLogMetrics(row, t)

    const trackNotes =
      row.geojson?.features
        ?.filter((f) => f.properties?.notes)
        .map((f) => ({
          time: f.properties.time ? dateFormatUTC(f.properties.time) : '',
          text: f.properties.notes,
        })) || []

    return {
      kind: 'trip',
      id: row.id,
      // Kept only to help resolve the composite map's vesselId in date-range
      // mode, where the URL has no vessel id of its own to fall back on.
      vesselId: row.vessel_id || row.vid || VesselStore.id,
      sortTime: row.started,
      day: dayKeyFromISO(row.started),
      name: row.name,
      from: row.from,
      to: row.to,
      fromTime: dateFormatUTC(row.started),
      toTime: dateFormatUTC(row.ended),
      distance: distanceFormatMiles(row.distance),
      distanceRaw: Number(row.distance) || 0,
      duration: durationFormatHours(row.duration) + ' ' + durationI18nHours(row.duration),
      notes: row.notes,
      avg_speed: speedFormatKnots(row.avg_speed),
      max_speed: speedFormatKnots(row.max_speed),
      max_wind_speed: speedFormatKnots(row.max_wind_speed),
      avg_wind_speed: speedFormatKnots(row?.extra?.avg_wind_speed || 0),
      tags: row.tags || [],
      seaState: (row?.observations?.seaState ?? -1) >= 0 ? t('seaState.' + row.observations.seaState) : '',
      cloudCoverage: (row?.observations?.cloudCoverage ?? -1) >= 0 ? row.observations.cloudCoverage + '/8' : '',
      visibility: (row?.observations?.visibility ?? -1) >= 0 ? t('visibility.' + row.observations.visibility) : '',
      trackNotes,
      // Per-trip map — distinct from the composite range map at the top of
      // the page. This is the one that actually disambiguates multiple legs
      // on the same day (e.g. harbor -> beach -> harbor), since a single
      // composite image can overlap retraced water into one confusing shape.
      // Gated on VITE_QGIS_URL the same way VITE_S3_URL gates photo uploads.
      mapImageUrl: import.meta.env.VITE_QGIS_URL
        ? `${import.meta.env.VITE_QGIS_URL}/log_${row.vessel_id || row.vid || VesselStore.id}_${row.id}.png`
        : null,
      ...derived,
    }
  }

  // Matches staylapse.vue's real notes_history() row shape.
  function mapStayRow(row) {
    const imageUrl =
      !row.has_image || !row.image_url
        ? null
        : row.image_url.startsWith('http')
        ? row.image_url
        : import.meta.env.VITE_PGSAIL_URL + row.image_url
    const iconUrl =
      row.stay_code === 3 ? '/mooring_icon.png' : row.stay_code === 4 ? '/dock_icon.png' : '/anchoricon.png'

    return {
      kind: 'stay',
      id: row.stay_id,
      sortTime: row.arrived,
      day: dayKeyFromISO(row.arrived),
      name: row.stay_name || t('logs.book.activeStay'),
      arrivedLabel: row.arrived ? dateFormatUTC(row.arrived) : '—',
      stayCode: row.stay_code,
      iconUrl,
      dms: decimalToDMS(row.latitude, row.longitude),
      notes: row.stay_notes,
      moorageNotes: row.moorage_notes,
      imageUrl,
    }
  }

  const trips = computed(() => rawLogs.value.map(mapTripRow))
  const stays = computed(() => rawStays.value.map(mapStayRow))
  const totalDistance = computed(() => trips.value.reduce((sum, t2) => sum + t2.distanceRaw, 0))

  // ---------------------------------------------------------------------------
  // Composite route map for the whole range: trip_<vesselId>_<start>_<end>[_sat].png
  // Single image, not one per trip. In log-range mode the ids come straight
  // from the URL (mirroring the end_log==='' -> end_log=start_log fallback
  // from the trip planner). In date-range mode there's no log id in the URL
  // at all, so it's derived from the fetched trips' min/max id instead.
  // ---------------------------------------------------------------------------
  const mapImageUrl = computed(() => {
    if (!import.meta.env.VITE_QGIS_URL) return null

    const vesselId = trips.value[0]?.vesselId || VesselStore.id
    if (!vesselId) return null

    let startLog = startLogId.value
    let endLog = endLogId.value || startLog

    if (!startLog) {
      const ids = trips.value.map((t2) => t2.id).filter((id) => id != null)
      if (!ids.length) return null
      startLog = Math.min(...ids)
      endLog = Math.max(...ids)
    }

    const suffix = mapType === 'Satellite' ? '_sat' : ''
    return `${import.meta.env.VITE_QGIS_URL}/trip_${vesselId}_${startLog}_${endLog}${suffix}.png`
  })

  // ---------------------------------------------------------------------------
  // Group trips + stays by day, sorted chronologically within each day.
  // A stay is attributed to its arrival date only — a stay spanning several
  // nights currently shows up once, under the day it began.
  // ---------------------------------------------------------------------------
  const days = computed(() => {
    const buckets = new Map()
    for (const item of [...trips.value, ...stays.value]) {
      if (!buckets.has(item.day)) buckets.set(item.day, { date: item.day, events: [] })
      buckets.get(item.day).events.push(item)
    }
    return Array.from(buckets.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((bucket) => ({
        ...bucket,
        dateLabel: formatDayLabel(bucket.date),
        events: bucket.events.slice().sort((a, b) => new Date(a.sortTime) - new Date(b.sortTime)),
      }))
  })

  const rangeLabel = computed(() => {
    if (!days.value.length) return ''
    const first = days.value[0].dateLabel
    const last = days.value[days.value.length - 1].dateLabel
    return first === last ? first : `${first} → ${last}`
  })

  function dailyNoteFor(dayKey) {
    return dailyNotes.value[dayKey] || null
  }

  onMounted(async () => {
    await fetchData()
    document.title = t('logs.book.title') + (rangeLabel.value ? ': ' + rangeLabel.value : '')
  })

  function printLogbook() {
    window.print()
  }
</script>

<style scoped>
  @media print {
    .print\:hidden {
      display: none !important;
    }
    .break-inside-avoid {
      break-inside: avoid;
    }
    .print-page-break {
      break-before: page;
    }
    img {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
