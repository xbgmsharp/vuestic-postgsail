<template>
  <va-card>
    <va-card-title>
      {{ $t('menu.journal') }}<span v-if="vesselName" class="journal-title__vessel"> — {{ vesselName }}</span>
    </va-card-title>
    <va-card-content>
      <!-- Filter bar -->
      <div class="journal-filter">
        <va-input v-model="search" clearable :placeholder="$t('logs.list.filter.name')" class="journal-filter__search">
          <template #prependInner><va-icon name="search" size="small" /></template>
        </va-input>
        <va-date-input
          v-model="dateRange"
          clearable
          mode="range"
          :placeholder="$t('logs.list.filter.date_range')"
          class="journal-filter__date"
        />
        <va-button
          preset="secondary"
          icon="print"
          :to="{ name: 'logslapse' }"
          target="_blank"
          class="journal-filter__print"
        >
          {{ $t('menu.print') }}
        </va-button>
      </div>

      <va-alert v-if="isError || isStaysError" color="danger" outline class="mb-4">
        {{ $t('api.error') }}
      </va-alert>

      <div class="journal-layout">
        <!-- Left: timeline -->
        <div class="journal-timeline">
          <!-- Year chips: mobile-only horizontal strip (hidden on desktop where the aside takes over) -->
          <div v-if="years.length" class="journal-years-mobile">
            <va-chip
              size="small"
              :outline="selectedYear !== null"
              :color="selectedYear === null ? 'primary' : 'secondary'"
              class="va-link cursor-pointer"
              @click="selectedYear = null"
            >
              {{ $t('logs.list.filter.all') }}
            </va-chip>
            <va-chip
              v-for="[year, count] in years"
              :key="year"
              size="small"
              :outline="selectedYear !== year"
              :color="selectedYear === year ? 'primary' : 'secondary'"
              class="va-link cursor-pointer"
              @click="selectedYear = year"
            >
              {{ year }}<span class="journal-aside__count">{{ count }}</span>
            </va-chip>
          </div>

          <!-- Summary -->
          <div v-if="filtered.length > 0" class="journal-stats">
            <span
              ><strong>{{ tripCount }}</strong> {{ $t('logs.list.trips') }}</span
            >
            <span class="journal-stats__sep">·</span>
            <span
              ><strong>{{ stayCount }}</strong> {{ $t('stays.stays') }}</span
            >
            <span class="journal-stats__sep">·</span>
            <span
              ><strong>{{ totalDistanceFormatted }}</strong> nm</span
            >
            <va-button
              v-if="selectedYear"
              preset="plain"
              size="small"
              icon="close"
              class="ml-1"
              @click="selectedYear = null"
            >
              {{ selectedYear }}
            </va-button>
          </div>

          <va-inner-loading :loading="isInitialLoading">
            <!-- Empty -->
            <div v-if="!isInitialLoading && filtered.length === 0" class="journal-empty">
              <va-icon name="menu_book" size="3rem" class="journal-empty__icon" />
              <p>{{ $t('nodata.nodata') }}</p>
            </div>

            <!-- Grouped by month -->
            <div v-for="[key, group] in grouped" :key="key" class="journal-month">
              <h2 class="journal-month__header">{{ group.label }}</h2>

              <div
                v-for="entry in group.entries"
                :key="`${entry.kind}-${entry.id}`"
                class="journal-entry"
                :class="{ 'journal-entry--stay': entry.kind === 'stay' }"
                role="link"
                tabindex="0"
                @click="goToEntry(entry)"
                @keyup.enter="goToEntry(entry)"
              >
                <!-- Date badge -->
                <div class="journal-entry__date" aria-hidden="true">
                  <div class="journal-entry__date-day">{{ dayOf(entry.sortTime) }}</div>
                  <div class="journal-entry__date-wd">{{ weekdayOf(entry.sortTime) }}</div>
                </div>

                <!-- Body: text + side thumbnail -->
                <div class="journal-entry__body">
                  <div class="journal-entry__content">
                    <!-- Trip -->
                    <template v-if="entry.kind === 'trip'">
                      <div class="journal-entry__route">
                        <span class="journal-entry__port">{{ entry.from || '—' }}</span>
                        <va-icon name="arrow_forward" size="small" class="journal-entry__arrow" />
                        <span class="journal-entry__port">{{ entry.to || '—' }}</span>
                      </div>
                      <div class="journal-entry__meta">
                        <va-icon name="straighten" size="small" class="journal-entry__meta-icon" />
                        {{ entry.distance }}
                        <span class="journal-entry__dot">·</span>
                        <va-icon name="schedule" size="small" class="journal-entry__meta-icon" />
                        {{ entry.duration }}
                      </div>
                      <div v-if="entry.avg_speed || entry.max_speed" class="journal-entry__meta">
                        <va-icon name="speed" size="small" class="journal-entry__meta-icon" />
                        <span class="journal-entry__label">{{ $t('logs.log.avg_speed') }}</span> {{ entry.avg_speed }}
                        <span class="journal-entry__dot">·</span>
                        <span class="journal-entry__label">{{ $t('logs.log.max_speed') }}</span> {{ entry.max_speed }}
                      </div>
                      <div
                        v-if="entry.seaState || entry.cloudCoverage || entry.visibility"
                        class="journal-entry__observations"
                      >
                        <span v-if="entry.seaState" class="journal-entry__obs-item">
                          <span class="journal-entry__label">{{ $t('logs.log.sea_state') }}</span> {{ entry.seaState }}
                        </span>
                        <span v-if="entry.cloudCoverage" class="journal-entry__obs-item">
                          <span class="journal-entry__label">{{ $t('logs.log.cloud_coverage') }}</span>
                          {{ entry.cloudCoverage }}
                        </span>
                        <span v-if="entry.visibility" class="journal-entry__obs-item">
                          <span class="journal-entry__label">{{ $t('logs.log.visibility') }}</span>
                          {{ entry.visibility }}
                        </span>
                      </div>
                      <p v-if="entry.notes" class="journal-entry__notes">{{ truncate(entry.notes) }}</p>
                      <tags-chip v-if="entry.tags && entry.tags.length" :tags="entry.tags" :max-show="4" class="mt-2" />
                    </template>

                    <!-- Stay -->
                    <template v-else>
                      <div class="journal-entry__route">
                        <img :src="entry.iconUrl" alt="" class="journal-entry__stay-icon" />
                        <span class="journal-entry__port journal-entry__port--stay">{{ entry.name }}</span>
                      </div>
                      <div class="journal-entry__meta">
                        <va-icon name="anchor" size="small" class="journal-entry__meta-icon" />
                        {{ entry.arrivedLabel }}
                        <template v-if="entry.duration">
                          <span class="journal-entry__dot">·</span>
                          <va-icon name="schedule" size="small" class="journal-entry__meta-icon" />
                          {{ entry.duration }}
                        </template>
                      </div>
                      <p v-if="entry.notes" class="journal-entry__notes">{{ truncate(entry.notes) }}</p>
                      <p v-if="entry.moorageNotes" class="journal-entry__notes">{{ truncate(entry.moorageNotes) }}</p>
                    </template>
                  </div>

                  <!-- Side thumbnail -->
                  <img
                    v-if="entry.thumb && thumbVisible[`${entry.kind}-${entry.id}`] !== false"
                    :src="entry.thumb"
                    :alt="entry.kind === 'trip' ? `${entry.from} → ${entry.to}` : entry.name"
                    class="journal-entry__thumb"
                    loading="lazy"
                    @error="thumbVisible[`${entry.kind}-${entry.id}`] = false"
                  />
                </div>

                <va-icon name="chevron_right" class="journal-entry__chevron" aria-hidden="true" />
              </div>
            </div>
          </va-inner-loading>

          <!-- Load more -->
          <div v-if="!isInitialLoading && hasMore" class="journal-load-more">
            <va-button preset="secondary" :loading="isLoadingMore" icon="expand_more" @click="loadMore">
              {{ $t('logs.list.load_more') }}
            </va-button>
          </div>
          <div v-else-if="!isInitialLoading && trips.length > 0 && !hasMore" class="journal-end">
            {{ $t('logs.list.no_more') }}
          </div>
        </div>

        <!-- Right: year chips (desktop only) -->
        <aside class="journal-aside" aria-label="Year filter">
          <div class="journal-aside__inner">
            <h3 class="journal-aside__heading">{{ $t('stats.year') }}</h3>
            <div class="journal-aside__chips">
              <va-chip
                size="small"
                :outline="selectedYear !== null"
                :color="selectedYear === null ? 'primary' : 'secondary'"
                class="va-link cursor-pointer"
                @click="selectedYear = null"
              >
                {{ $t('logs.list.filter.all') }}
              </va-chip>
              <va-chip
                v-for="[year, count] in years"
                :key="year"
                size="small"
                :outline="selectedYear !== year"
                :color="selectedYear === year ? 'primary' : 'secondary'"
                class="va-link cursor-pointer"
                @click="selectedYear = year"
              >
                {{ year }}<span class="journal-aside__count">{{ count }}</span>
              </va-chip>
            </div>
          </div>
        </aside>
      </div>
    </va-card-content>
  </va-card>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useQuery } from '@tanstack/vue-query'
  import { storeToRefs } from 'pinia'
  import PostgSail from '../../services/api-client'
  import { useVesselStore } from '../../stores/vessel-store'
  import { distanceFormatMiles } from '../../utils/distanceFormatter.js'
  import { durationFormatHours, durationI18nHours, dateFormatUTC } from '../../utils/dateFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import TagsChip from '../../components/TagsChip.vue'

  const PAGE_SIZE = 10

  const { locale, t } = useI18n()
  const router = useRouter()
  const api = new PostgSail()

  const VesselStore = useVesselStore()
  const { vesselName, vesselId } = storeToRefs(VesselStore)

  const qgisUrl = import.meta.env.VITE_QGIS_URL as string | undefined
  const pgsailUrl = import.meta.env.VITE_PGSAIL_URL as string | undefined

  const thumbVisible = reactive<Record<string, boolean>>({})

  const search = ref('')
  const dateRange = ref<{ start: Date; end: Date } | null>(null)
  const selectedYear = ref<number | null>(null)

  // ── Trips: paginated, appended on demand ─────────────────────────────────────
  const trips = ref<any[]>([])
  const isInitialLoading = ref(true)
  const isLoadingMore = ref(false)
  const isError = ref(false)
  const hasMore = ref(true)

  async function loadMore() {
    if (isLoadingMore.value || !hasMore.value) return
    isLoadingMore.value = true
    try {
      const batch = await api.logs_range(`order=started.desc&limit=${PAGE_SIZE}&offset=${trips.value.length}`)
      const rows = Array.isArray(batch) ? batch : []
      trips.value = [...trips.value, ...rows.map(mapTrip)]
      hasMore.value = rows.length === PAGE_SIZE
    } catch {
      isError.value = true
    } finally {
      isLoadingMore.value = false
    }
  }

  onMounted(async () => {
    await loadMore()
    isInitialLoading.value = false
  })

  // ── Stays: load all once, displayed within loaded trips' date window ──────────
  const { data: staysData, isError: isStaysError } = useQuery({
    queryKey: ['journal', 'stays-all'],
    queryFn: () => api.notes_history(),
    staleTime: 10 * 60 * 1000,
  })

  // Oldest trip start date among loaded trips — stays older than this are hidden
  // until the user loads more trips that reach that period.
  const oldestTripDate = computed<string | null>(() =>
    trips.value.length > 0 ? trips.value[trips.value.length - 1].sortTime : null,
  )

  // ── Map trips ─────────────────────────────────────────────────────────────────
  function mapTrip(row: any) {
    const vid = row.vessel_id || row.vid || vesselId.value
    return {
      kind: 'trip' as const,
      id: row.id as number,
      sortTime: row.started as string,
      from: row.from as string,
      to: row.to as string,
      distance: distanceFormatMiles(row.distance),
      distanceRaw: Number(row.distance) || 0,
      duration: row.duration ? `${durationFormatHours(row.duration)} ${durationI18nHours(row.duration)}` : null,
      avg_speed: speedFormatKnots(row.avg_speed),
      max_speed: speedFormatKnots(row.max_speed),
      seaState: (row?.observations?.seaState ?? -1) >= 0 ? (t('seaState.' + row.observations.seaState) as string) : '',
      cloudCoverage:
        (row?.observations?.cloudCoverage ?? -1) >= 0 ? ((row.observations.cloudCoverage + '/8') as string) : '',
      visibility:
        (row?.observations?.visibility ?? -1) >= 0 ? (t('visibility.' + row.observations.visibility) as string) : '',
      notes: row.notes as string | null,
      tags: (row.tags as string[]) || [],
      thumb: qgisUrl && vid ? `${qgisUrl}/log_${vid}_${row.id}.png` : null,
    }
  }

  // ── Map stays ─────────────────────────────────────────────────────────────────
  function stayIconUrl(stayCode: number): string {
    if (stayCode === 3) return '/mooring_icon.png'
    if (stayCode === 4) return '/dock_icon.png'
    return '/anchoricon.png'
  }

  function mapStay(row: any) {
    let imageUrl: string | null = null
    if (row.has_image && row.image_url) {
      imageUrl = row.image_url.startsWith('http') ? row.image_url : (pgsailUrl ?? '') + row.image_url
    }
    return {
      kind: 'stay' as const,
      id: row.stay_id as number,
      sortTime: row.arrived as string,
      name: row.stay_name || t('logs.book.activeStay'),
      arrivedLabel: row.arrived ? dateFormatUTC(row.arrived) : '—',
      duration: row.duration ? `${durationFormatHours(row.duration)} ${durationI18nHours(row.duration)}` : null,
      stayCode: row.stay_code as number,
      iconUrl: stayIconUrl(row.stay_code),
      notes: row.stay_notes as string | null,
      moorageNotes: row.moorage_notes as string | null,
      thumb: imageUrl,
    }
  }

  type TripEntry = ReturnType<typeof mapTrip>
  type StayEntry = ReturnType<typeof mapStay>
  type JournalEntry = TripEntry | StayEntry

  // Stays visible within the date window of loaded trips
  const visibleStays = computed<StayEntry[]>(() => {
    const rawStays = (staysData.value as any[]) ?? []
    const oldest = oldestTripDate.value
    return rawStays.filter((s) => !oldest || (s.arrived && s.arrived >= oldest)).map(mapStay)
  })

  const allEntries = computed<JournalEntry[]>(() => [...trips.value, ...visibleStays.value])

  // ── Year list from all loaded entries ─────────────────────────────────────────
  const years = computed(() => {
    const map = new Map<number, number>()
    for (const e of allEntries.value) {
      if (!e.sortTime) continue
      const y = new Date(e.sortTime).getFullYear()
      map.set(y, (map.get(y) ?? 0) + 1)
    }
    return [...map.entries()].sort(([a], [b]) => b - a)
  })

  // ── Filtered entries ──────────────────────────────────────────────────────────
  const filtered = computed<JournalEntry[]>(() => {
    let list = allEntries.value
    if (selectedYear.value !== null) {
      list = list.filter((e) => e.sortTime && new Date(e.sortTime).getFullYear() === selectedYear.value)
    }
    if (search.value) {
      const q = search.value.toLowerCase()
      list = list.filter((e) => {
        if (e.kind === 'trip') {
          return (
            e.from?.toLowerCase().includes(q) || e.to?.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q)
          )
        }
        return e.name?.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q)
      })
    }
    if (dateRange.value?.start && dateRange.value?.end) {
      const { start, end } = dateRange.value
      list = list.filter((e) => {
        if (!e.sortTime) return false
        const d = new Date(e.sortTime)
        return d >= start && d <= end
      })
    }
    return list
  })

  const tripCount = computed(() => filtered.value.filter((e) => e.kind === 'trip').length)
  const stayCount = computed(() => filtered.value.filter((e) => e.kind === 'stay').length)
  const totalDistanceFormatted = computed(() =>
    filtered.value
      .filter((e): e is TripEntry => e.kind === 'trip')
      .reduce((sum, e) => sum + e.distanceRaw, 0)
      .toFixed(0),
  )

  // ── Grouped by year-month, sorted descending ──────────────────────────────────
  function bcp47(loc: string) {
    const map: Record<string, string> = { gb: 'en-GB', br: 'pt-BR' }
    return map[loc] ?? loc
  }

  const grouped = computed(() => {
    const groups = new Map<string, { label: string; entries: JournalEntry[] }>()
    const lang = bcp47(locale.value)
    for (const entry of filtered.value) {
      if (!entry.sortTime) continue
      const d = new Date(entry.sortTime)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!groups.has(key)) {
        groups.set(key, {
          label: d.toLocaleDateString(lang, { year: 'numeric', month: 'long' }),
          entries: [],
        })
      }
      groups.get(key)!.entries.push(entry)
    }
    return [...groups.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(
        ([k, g]) =>
          [
            k,
            {
              ...g,
              entries: g.entries.slice().sort((a, b) => b.sortTime.localeCompare(a.sortTime)),
            },
          ] as const,
      )
  })

  function dayOf(iso: string) {
    return new Date(iso).getDate()
  }

  function weekdayOf(iso: string) {
    return new Date(iso).toLocaleDateString(bcp47(locale.value), { weekday: 'short' })
  }

  function truncate(text: string, len = 160) {
    return text && text.length > len ? text.slice(0, len) + '…' : text
  }

  function goToEntry(entry: JournalEntry) {
    if (entry.kind === 'trip') {
      router.push({ name: 'log-map', params: { id: entry.id } })
    } else {
      router.push({ name: 'stay-details', params: { id: entry.id } })
    }
  }
</script>

<style lang="scss" scoped>
  .journal-title__vessel {
    font-weight: 400;
    opacity: 0.6;
    font-size: 0.9em;
  }

  // ── Filter bar ──────────────────────────────────────────────────────────────
  .journal-filter {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.25rem;

    @media (min-width: 640px) {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }

    &__search {
      width: 100%;
      @media (min-width: 640px) {
        width: 14rem;
      }
    }

    &__date {
      width: 100%;
      @media (min-width: 640px) {
        flex: 1;
        min-width: 15rem;
        max-width: 22rem;
      }
    }

    &__print {
      width: 100%;
      @media (min-width: 640px) {
        width: auto;
        margin-left: auto;
      }
    }
  }

  // ── Two-column layout ────────────────────────────────────────────────────────
  .journal-layout {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;

    @media (min-width: 1024px) {
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
    }
  }

  .journal-timeline {
    flex: 1;
    min-width: 0;
  }

  // ── Stats bar ─────────────────────────────────────────────────────────────────
  .journal-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    color: var(--va-secondary);
    margin-bottom: 1rem;

    &__sep {
      opacity: 0.4;
    }
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  .journal-empty {
    text-align: center;
    padding: 4rem 0;
    color: var(--va-secondary);

    &__icon {
      display: block;
      margin: 0 auto 1rem;
      opacity: 0.25;
    }
  }

  // ── Load more ────────────────────────────────────────────────────────────────
  .journal-load-more {
    display: flex;
    justify-content: center;
    padding: 1.5rem 0 0.5rem;
  }

  .journal-end {
    text-align: center;
    padding: 1rem 0;
    font-size: 0.875rem;
    color: var(--va-secondary);
    opacity: 0.4;
    letter-spacing: 0.1em;
  }

  // ── Month group ──────────────────────────────────────────────────────────────
  .journal-month {
    margin-bottom: 2rem;

    &__header {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--va-secondary);
      opacity: 0.65;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--va-background-border);
      margin-bottom: 0.25rem;
    }
  }

  // ── Entry row ────────────────────────────────────────────────────────────────
  .journal-entry {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
      background: var(--va-background-element);
    }
    &:focus-visible {
      outline: 2px solid var(--va-primary);
      outline-offset: 2px;
    }

    &--stay {
      border-left: 3px solid var(--va-secondary);
      padding-left: 0.6rem;
      border-radius: 0 0.5rem 0.5rem 0;
      opacity: 0.85;
    }

    &__date {
      flex: 0 0 2.5rem;
      text-align: center;
      padding-top: 0.1rem;
    }
    &__date-day {
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
    }
    &__date-wd {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--va-secondary);
      opacity: 0.65;
    }

    &__body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 0.75rem;
    }

    &__content {
      flex: 1;
      min-width: 0;
    }

    &__thumb {
      flex: 0 0 5rem;
      width: 5rem;
      height: 5rem;
      object-fit: cover;
      border-radius: 0.375rem;
      background: var(--va-background-element);
      align-self: center;

      @media (min-width: 640px) {
        flex: 0 0 7rem;
        width: 7rem;
        height: 7rem;
      }
    }

    &__stay-icon {
      display: inline-block;
      width: 1rem;
      height: 1rem;
      vertical-align: middle;
      flex-shrink: 0;
    }

    &__route {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.9375rem;
      font-weight: 600;
      flex-wrap: wrap;
    }

    &__port {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 14ch;
      @media (min-width: 480px) {
        max-width: 20ch;
      }
      @media (min-width: 768px) {
        max-width: 26ch;
      }
      &--stay {
        max-width: 24ch;
        @media (min-width: 480px) {
          max-width: 32ch;
        }
      }
    }

    &__arrow {
      flex-shrink: 0;
      opacity: 0.45;
    }

    &__meta {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8125rem;
      color: var(--va-secondary);
      margin-top: 0.25rem;
      flex-wrap: wrap;
    }
    &__meta-icon {
      opacity: 0.5;
      flex-shrink: 0;
    }
    &__dot {
      opacity: 0.3;
      margin: 0 0.2rem;
    }

    &__label {
      font-size: 0.6875rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--va-secondary);
      opacity: 0.65;
      margin-right: 0.1rem;
    }

    &__observations {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
      font-size: 0.8125rem;
    }

    &__obs-item {
      white-space: nowrap;
    }

    &__notes {
      font-size: 0.8125rem;
      color: var(--va-secondary);
      margin-top: 0.375rem;
      line-height: 1.4;
      font-style: italic;
    }

    &__chevron {
      flex-shrink: 0;
      opacity: 0.25;
      align-self: center;
    }
  }

  // ── Year chips — mobile horizontal strip ────────────────────────────────────
  .journal-years-mobile {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.375rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    margin-bottom: 0.75rem;
    // Hide scrollbar visually but keep scrollable
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 1024px) {
      display: none; // desktop uses the aside instead
    }
  }

  // ── Year aside — desktop only ─────────────────────────────────────────────
  .journal-aside {
    display: none;

    @media (min-width: 1024px) {
      display: block;
      flex: 0 0 11rem;
    }

    &__inner {
      position: sticky;
      top: 1rem;
      padding: 1rem;
      border-radius: 0.75rem;
      background: var(--va-background-element);
    }

    &__heading {
      font-size: 0.6875rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--va-secondary);
      opacity: 0.65;
      margin-bottom: 0.625rem;
    }

    &__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    &__count {
      margin-left: 0.3rem;
      font-size: 0.6875rem;
      opacity: 0.6;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
