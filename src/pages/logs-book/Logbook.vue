<template>
  <template v-if="days.length === 0 && !isBusy && !apiError"> No data to display </template>
  <template v-else>
    <div class="p-4 relative">
      <!-- Print trigger (hidden when actually printing) -->
      <button
        class="fixed top-4 right-4 bg-gray-300 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg print:hidden"
        :title="$t('logs.book.print') || 'Print Logbook'"
        @click="printLogbook"
      >
        🖨️
      </button>

      <va-alert v-if="apiError" color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
      <va-alert v-else-if="!isBusy && !hasRangeParams" color="warning" outline class="mb-4">
        {{ $t('logs.book.noRange') || 'No log range or date range specified.' }}
      </va-alert>

      <va-inner-loading :loading="isBusy">
        <div v-if="days.length" id="logbook-print">
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
                {{ $t('logs.book.mapUnavailable') || 'Map unavailable' }}
              </div>
            </va-card-content>
          </va-card>

          <!-- Range summary -->
          <va-card class="shadow-md rounded-lg mb-8 break-inside-avoid">
            <va-card-content>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span class="text-gray-500 block">{{ $t('logs.book.days') || 'Days' }}</span>
                  {{ days.length }}
                </div>
                <div>
                  <span class="text-gray-500 block">{{ $t('logs.book.trips') || 'Trips' }}</span>
                  {{ trips.length }}
                </div>
                <div>
                  <span class="text-gray-500 block">{{ $t('stays.details.title') || 'Stays' }}</span>
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
                      {{ $t('logs.book.mapUnavailable') || 'Map unavailable' }}
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
                        <span class="text-gray-500 block">{{ $t('logs.log.avg_speed') }}</span
                        >{{ event.avg_speed }}
                      </div>
                      <div>
                        <span class="text-gray-500 block">{{ $t('logs.log.max_speed') }}</span
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
                  <va-card-title>{{ $t('logs.book.trackNotes') || 'Point notes' }}</va-card-title>
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
                          >{{ event.sailMotorSplit.motor.distance }} nm ·
                          {{ event.sailMotorSplit.motor.duration }}</span
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
                        <dt class="text-gray-600 dark:text-gray-400">
                          {{ engine.name }} {{ $t('logs.log.run_time') }}
                        </dt>
                        <dd class="font-mono text-right">{{ engine.duration }}</dd>
                      </div>
                      <div
                        v-for="metric in event.propulsionMetrics"
                        :key="metric.key"
                        class="flex justify-between py-1"
                      >
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
                      <div
                        v-for="{ key, value } in event.unhandledMetrics"
                        :key="key"
                        class="flex justify-between py-1"
                      >
                        <dt class="text-gray-600 dark:text-gray-400">{{ formatMetricKey(key) }}</dt>
                        <dd class="font-mono text-right">{{ formatMetricValue(key, value) }}</dd>
                      </div>
                    </dl>
                  </va-card-content>
                </va-card>

                <va-card class="shadow-md rounded-lg break-inside-avoid">
                  <va-card-title>{{ $t('logs.log.observations') || 'Observations' }}</va-card-title>
                  <va-card-content>
                    <div class="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span class="text-gray-500 block">{{ $t('logs.log.sea_state') }}</span
                        >{{ event.seaState }}
                      </div>
                      <div>
                        <span class="text-gray-500 block">{{ $t('logs.log.cloud_coverage') }}</span
                        >{{ event.cloudCoverage }}
                      </div>
                      <div>
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
  const dailyNotes = ref({}) // date -> note text, once daily_notes exists
  const mapImageError = ref(false)
  const mapImageErrors = ref({})

  // Query-string — same contract as timelapse:
  // /loglapse?start_log=7953&end_log=7953&map_type=Satellite
  // /loglapse?start_date=2026-07-06&end_date=2026-07-10&map_type=Satellite
  const queryParams = computed(() => ({
    start_log: route.query.start_log || null,
    end_log: route.query.end_log || null,
    start_date: route.query.start_date || null,
    end_date: route.query.end_date || null,
    map_type: route.query.map_type || 'Satellite',
  }))

  const hasRangeParams = computed(() => {
    const p = queryParams.value
    return !!(p.start_log || p.end_log || p.start_date || p.end_date)
  })

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  // Logs: api.logs_range(filterQuery) takes a raw PostgREST filter string
  // (e.g. "id=gte.1&id=lte.5" or "started=gte.2026-07-06&ended=lte.2026-07-10")
  // and returns full log rows, same shape as log_get's response.
  //
  // Stays: api.notes_history() takes no range params and returns the full
  // note history for the vessel, so range filtering happens client-side
  // against the resolved date window — computeDateWindow() takes the
  // *parsed* query params object (not the PostgREST filter string), falling
  // back to the fetched trips' min/max started/ended when only start_log/
  // end_log were given.
  function computeDateWindow(params, logs) {
    if (params.start_date || params.end_date) {
      return { start: params.start_date, end: params.end_date }
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

  // Plain string comparison works here since ISO 8601 timestamps sort
  // lexicographically the same as chronologically — holds as long as the
  // backend returns them in a consistent format.
  function withinWindow(iso, window) {
    if (!iso) return false
    if (window.start && iso < window.start) return false
    if (window.end && iso > window.end) return false
    return true
  }

  async function fetchData() {
    if (!hasRangeParams.value) return
    isBusy.value = true
    apiError.value = null
    try {
      const params = queryParams.value
      let filterQuery
      if (params.start_log && params.end_log) {
        filterQuery = `id=gte.${params.start_log}&id=lte.${params.end_log}`
      } else if (params.start_date && params.end_date) {
        filterQuery = `started=gte.${params.start_date}&ended=lte.${params.end_date}`
      } else {
        console.warn('No valid range parameters provided; skipping fetch.')
        return
      }

      const logs = await api.logs_range(filterQuery)
      rawLogs.value = logs || []

      const allStays = await api.notes_history()
      // NOTE: pass the parsed params object here, not filterQuery — that was
      // a bug in the previous draft (computeDateWindow read .start_date off
      // the raw filter string and always got undefined).
      const window = computeDateWindow(params, rawLogs.value)
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
    if (dayKey === 'unknown') return t('logs.book.unknownDate') || 'Unknown date'
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
      seaState: row?.observations?.seaState ?? -1,
      cloudCoverage: row?.observations?.cloudCoverage ?? -1,
      visibility: row?.observations?.visibility ?? -1,
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
      name: row.stay_name || t('logs.book.activeStay') || 'Active Stay',
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

    let startLog = queryParams.value.start_log
    let endLog = queryParams.value.end_log || startLog

    if (!startLog) {
      const ids = trips.value.map((t2) => t2.id).filter((id) => id != null)
      if (!ids.length) return null
      startLog = Math.min(...ids)
      endLog = Math.max(...ids)
    }

    const suffix = queryParams.value.map_type === 'Satellite' ? '_sat' : ''
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
    document.title = (t('logs.book.title') || 'Logbook') + (rangeLabel.value ? ': ' + rangeLabel.value : '')
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
