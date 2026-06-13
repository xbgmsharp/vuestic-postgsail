<template>
  <div>
    <va-card>
      <va-card-title>{{ title }}</va-card-title>
      <va-card-content>
        <!-- Error -->
        <template v-if="stays.isError.value">
          <va-alert color="danger" outline class="mb-4"
            >{{ $t('api.error') }}: {{ stays.error.value?.message }}</va-alert
          >
        </template>

        <!-- Filters -->
        <div class="flex flex-col lg:flex-row items-center gap-4 mb-4 justify-between">
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
              :placeholder="$t('stays.list.filter.name')"
              size="large"
              class="flex-1"
            />
            <va-date-input
              v-model="filter.dateRange"
              :clearable="true"
              :placeholder="$t('stays.list.filter.date_range')"
              mode="range"
              size="large"
              class="flex-1"
            />
            <va-select
              v-model="filter.stayed_at_ids"
              :placeholder="$t('stays.list.filter.stay_type')"
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

        <!-- No data at all (not a filter issue) -->
        <no-data-screen v-if="stays.isSuccess.value && stays.totalCount.value === 0 && !hasActiveFilters" />

        <!-- No results matching active filters -->
        <va-alert
          v-else-if="stays.isSuccess.value && stays.totalCount.value === 0 && hasActiveFilters"
          color="info"
          outline
          class="mb-4"
        >
          {{ $t('stays.list.no_results') }}
        </va-alert>

        <template v-else>
          <stays-cards
            v-if="doShowAsCards === 1"
            :items="items"
            :loading="stays.isFetching.value"
            @updateStayedAt="updateStayedAt"
          />
          <stays-table
            v-if="doShowAsCards === 2"
            :items="items"
            :loading="stays.isFetching.value"
            @updateStayedAt="updateStayedAt"
          />
        </template>

        <template v-if="stays.totalCount.value > pageSize">
          <div class="mt-3 row justify-center">
            <va-pagination v-model="currentPage" input :pages="stays.totalPages.value" />
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
            v-if="stays.totalCount.value > 0"
            name="csv"
            outline
            :size="34"
            style="grid-column-end: 13"
            class="themed"
            @click="handleCSV()"
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
  import { durationFormatDays, stayGeneratedName } from '../../utils/dateFormatter.js'
  import { downloadFile } from '../../utils/handleExports'
  import NoDataScreen from '../../components/noDataScreen.vue'
  import { useVesselStore } from '../../stores/vessel-store'
  import { useGlobalStore } from '../../stores/global-store'
  import { storeToRefs } from 'pinia'
  import { useStaysList, useUpdateStay, exportStaysCSV } from '../../queries/stays'
  import StaysCards from './widgets/Cards.vue'
  import StaysTable from './widgets/Table.vue'

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

  const stayOptions = computed(() => [
    { value: 1, text: t('id.stay_code.1') },
    { value: 2, text: t('id.stay_code.2') },
    { value: 3, text: t('id.stay_code.3') },
    { value: 4, text: t('id.stay_code.4') },
  ])

  const filter = reactive({ name: null, dateRange: null, stayed_at_ids: [] })

  const hasActiveFilters = computed(() => !!filter.name || !!filter.dateRange || filter.stayed_at_ids.length > 0)

  const queryFilters = ref({ name: null, dateRange: null, stayed_at_ids: [] })
  watchDebounced(
    () => ({
      name: filter.name,
      dateRange: filter.dateRange,
      stayed_at_ids: filter.stayed_at_ids.map((o) => o.value),
    }),
    (val) => {
      currentPage.value = 1
      queryFilters.value = val
    },
    { debounce: 400, immediate: true },
  )

  const stays = useStaysList({ page: currentPage, pageSize, filters: queryFilters })

  const items = computed(() =>
    stays.items.value.map((row) => ({
      id: row.id ?? null,
      name: stayGeneratedName(row.duration, row.moorage ?? '', row.departed ?? null),
      moorage: row.moorage ?? '',
      moorage_id: row.moorage_id ?? null,
      arrived: row.arrived ?? null,
      arrived_log_id: row.arrived_log_id ?? null,
      departed: row.departed ?? null,
      departed_log_id: row.departed_log_id ?? null,
      stayed_at: row.stayed_at ?? '',
      stayed_at_id: row.stayed_at_id ?? null,
      duration: durationFormatDays(row.duration),
    })),
  )

  const summary = computed(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const row of stays.items.value) {
      const id = row.stayed_at_id
      if (id in counts) counts[id]++
    }
    return stayOptions.value
      .map((opt) => ({ label: opt.text, count: counts[opt.value] ?? 0 }))
      .filter((e) => e.count > 0)
  })

  const title = t('stays.list.title') + ' ' + vesselName
  document.title = setAppTitle(title)

  function deleteChip(chip) {
    filter.stayed_at_ids = filter.stayed_at_ids.filter((v) => v.value !== chip.value)
  }

  const { mutateAsync: updateStay } = useUpdateStay()

  async function updateStayedAt(stay_code, id) {
    if (!stay_code || stay_code <= 0) return
    try {
      await updateStay({ id: String(id), payload: { stay_code } })
    } catch (err) {
      console.error('updateStayedAt failed', err)
    }
  }

  const isExporting = ref(false)

  async function handleCSV() {
    isExporting.value = true
    try {
      const csv = await exportStaysCSV(queryFilters.value)
      downloadFile(csv, 'text/csv', 'PostgSail_Stays.csv')
    } catch (err) {
      console.error('CSV export failed', err)
    } finally {
      isExporting.value = false
    }
  }
</script>
