<template>
  <div>
    <va-card class="mb-3">
      <va-card-title>{{ title }}</va-card-title>
      <va-card-content>
        <template v-if="moorages.isError.value">
          <va-alert color="danger" outline class="mb-4"
            >{{ $t('api.error') }}: {{ moorages.error.value?.message }}</va-alert
          >
        </template>
        <div class="flex flex-col lg:flex-row items-center gap-4 mb-2 justify-between">
          <va-button-toggle
            v-model="doShowAsCards"
            preset="secondary"
            border-color="primary"
            size="large"
            :options="[
              { label: 'Cards', value: 1 },
              { label: 'Table', value: 2 },
            ]"
          />
          <div class="layout flex flex-col lg:flex-row gap-4 flex-1">
            <va-input
              v-model="filter.name"
              :clearable="true"
              :placeholder="$t('moorages.list.filter.name')"
              size="large"
              class="flex-1"
            />
            <va-select
              v-model="filter.default_stay_ids"
              :placeholder="$t('moorages.list.filter.stay_type')"
              :options="stayOptions"
              size="large"
              class="flex-1"
              multiple
            >
              <template #content="{ value }">
                <va-chip
                  v-for="chip in value"
                  :key="chip.value"
                  size="small"
                  class="mr-2"
                  outline
                  closeable
                  @update:modelValue="deleteChip(chip)"
                >
                  {{ chip.text }}
                </va-chip>
              </template>
            </va-select>
          </div>
        </div>

        <moorage-cards
          v-if="doShowAsCards === 1"
          :items="items"
          :loading="moorages.isFetching.value"
          @updateDefaultStay="updateDefaultStay"
        />
        <moorage-table
          v-if="doShowAsCards === 2"
          :items="items"
          :loading="moorages.isFetching.value"
          @updateDefaultStay="updateDefaultStay"
        />

        <template v-if="moorages.totalCount.value > pageSize">
          <div class="mt-3 row justify-center">
            <va-pagination v-model="currentPage" input :pages="moorages.totalPages.value" />
          </div>
        </template>
        <template v-if="items.length > 0">
          <div class="flex flex-wrap gap-4 mt-4 py-3 border-t border-[var(--va-background-element)] text-md">
            <div v-for="entry in summary" :key="entry.label" class="flex items-center gap-1">
              <va-chip size="small" outline>{{ entry.count }}</va-chip>
              <span class="text-[var(--va-secondary)]">{{ entry.label }}</span>
            </div>
          </div>
        </template>

        <div class="flex mt-4">
          <va-icon
            v-if="moorages.totalCount.value > 0"
            name="csv"
            outline
            :size="34"
            style="grid-column-end: 11"
            class="themed"
            @click="handleCSV()"
          ></va-icon>
          <va-icon
            v-if="moorages.totalCount.value > 0"
            name="gpx"
            outline
            :size="34"
            style="grid-column-end: 12"
            class="themed"
            @click="handleGPX()"
          ></va-icon>
          <va-icon
            v-if="moorages.totalCount.value > 0"
            name="geojson"
            outline
            :size="34"
            style="grid-column-end: 13"
            class="themed"
            @click="handleGeoJSON()"
          ></va-icon>
          <va-icon
            v-if="moorages.totalCount.value > 0"
            name="kml"
            outline
            :size="34"
            style="grid-column-end: 14"
            class="themed"
            @click="handleKML()"
          ></va-icon>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { watchDebounced } from '@vueuse/core'
  import { setAppTitle } from '../../utils/app.js'
  import { handleExport, downloadFile } from '../../utils/handleExports'
  import { durationFormatDays } from '../../utils/dateFormatter.js'
  import { useVesselStore } from '../../stores/vessel-store'
  import { useGlobalStore } from '../../stores/global-store'
  import { storeToRefs } from 'pinia'
  import { useMooragesList, useUpdateMoorage, exportMooragesCSV } from '../../queries/moorages'
  import MoorageCards from './widgets/Cards.vue'
  import MoorageTable from './widgets/Table.vue'

  const { vesselName } = useVesselStore()
  const { t } = useI18n()
  const GlobalStore = useGlobalStore()
  const { isMobile, doShowAsCards } = storeToRefs(GlobalStore)

  if (isMobile.value) doShowAsCards.value = 1
  watch(doShowAsCards, () => {
    GlobalStore.$state.doShowAsCards = doShowAsCards.value
  })

  const pageSize = 20
  const currentPage = ref(1)
  const sorting = ref({ sortBy: 'total_stay', sortingOrder: 'desc' })

  const stayOptions = computed(() => [
    { value: 1, text: t('id.stay_code.1') },
    { value: 2, text: t('id.stay_code.2') },
    { value: 3, text: t('id.stay_code.3') },
    { value: 4, text: t('id.stay_code.4') },
  ])

  const filter = reactive({ name: null, default_stay_ids: [] })

  // Debounced name filter (avoids a request on every keystroke)
  const queryFilters = ref({ name: null, default_stay_ids: [], sortBy: 'total_stay', sortingOrder: 'desc' })
  watchDebounced(
    () => ({ name: filter.name, default_stay_ids: filter.default_stay_ids.map((o) => o.value) }),
    (val) => {
      currentPage.value = 1
      queryFilters.value = { ...queryFilters.value, ...val }
    },
    { debounce: 400, immediate: true },
  )
  // Sort changes apply immediately
  watch(sorting, (val) => {
    currentPage.value = 1
    queryFilters.value = { ...queryFilters.value, sortBy: val.sortBy, sortingOrder: val.sortingOrder }
  })

  const moorages = useMooragesList({ page: currentPage, pageSize, filters: queryFilters })

  const items = computed(() =>
    moorages.items.value.map((row) => ({
      id: row.id,
      moorage: row.moorage,
      default_stay: row.default_stay,
      default_stay_id: row.default_stay_id,
      total_stay: durationFormatDays(row.total_duration),
      arrivals_departures: row.arrivals_departures,
    })),
  )

  const summary = computed(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const row of moorages.items.value) {
      const id = row.default_stay_id
      if (id in counts) counts[id]++
    }
    return stayOptions.value
      .map((opt) => ({ label: opt.text, count: counts[opt.value] ?? 0 }))
      .filter((e) => e.count > 0)
  })

  const title = t('moorages.list.title') + ' ' + vesselName
  document.title = setAppTitle(title)

  function deleteChip(chip) {
    filter.default_stay_ids = filter.default_stay_ids.filter((v) => v.value !== chip.value)
  }

  const { mutateAsync: updateMoorage } = useUpdateMoorage()

  const updateDefaultStay = async (stay_code, id) => {
    if (!stay_code || stay_code <= 0) return
    try {
      await updateMoorage({ id: String(id), payload: { stay_code } })
    } catch (err) {
      console.error('updateDefaultStay failed', err)
    }
  }

  const isExporting = ref(false)

  async function handleCSV() {
    isExporting.value = true
    try {
      const csv = await exportMooragesCSV(queryFilters.value)
      downloadFile(csv, 'text/csv', 'PostgSail_Moorages.csv')
    } catch (err) {
      console.error('CSV export failed', err)
    } finally {
      isExporting.value = false
    }
  }

  function handleGPX() {
    handleExport('gpx', 'moorages', undefined)
  }
  function handleGeoJSON() {
    handleExport('geojson', 'moorages', undefined)
  }
  function handleKML() {
    handleExport('kml', 'moorages', undefined)
  }
</script>

<style lang="scss" scoped>
  .va-data-table {
    overflow-x: auto;
  }
</style>
