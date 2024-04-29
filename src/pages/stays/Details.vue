<template>
  <div>
    <va-card class="mb-3">
      <template v-if="item && item.moorage_id">
        <va-card-content>
          <Map style="width: 100%; height: 40vh" :zoom="13" :moorage-map-id="Number.parseInt(item.moorage_id)" />
        </va-card-content>
      </template>
    </va-card>
    <va-card class="mb-3">
      <va-card-title>{{ $t('stays.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <!--<div class="mb-3 my-3">
          <template v-if="!isBusy && item">
            <lMap :geo-json-features="mapGeoJsonFeatures" style="width: 100%; height: 350px" />
          </template>
        </div>-->
        <va-inner-loading :loading="isBusy">
          <template v-if="item && item.moorage_id">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.name') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <VaValue v-slot="v">
                    <input
                      v-if="v.value"
                      v-model="formData.name"
                      outline
                      :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                      style="min-width: 100px; max-width: 50%"
                      class="inputbox"
                      @change="handleSubmit"
                    />
                    <span v-else>
                      {{ formData.name }}
                    </span>

                    <VaButton
                      :icon="v.value ? 'save' : 'edit'"
                      preset="plain"
                      size="small"
                      @click="v.value = !v.value"
                    />
                  </VaValue>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.moorage') }}</dt>
                <!--<dd class="flex xs12 md6 pa-2">{{ item.moorage }}</dd>-->
                <dd class="flex xs12 md6 pa-2">
                  <router-link class="link" :to="{ name: 'moorage-details', params: { id: item.moorage_id } }">
                    {{ item.moorage }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.duration') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  {{ durationFormatHours(item.duration) }} {{ durationI18nHours(item.duration) }} /
                  {{ durationI18nDays(item.duration) }}
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.stayed_at') }}</dt>
                <dd class="flex">
                  <div>
                    <StayAt
                      v-if="item.stayed_at_id"
                      :id="parseInt(route.params.id)"
                      :data="parseInt(item.stayed_at_id)"
                      @clickFromChildComponent="updateStayedAt"
                    />
                    <!--
                    <va-select
                      v-model="stayed_at_options[item.stayed_at_id]"
                      :options="stayed_at_options"
                      :placeholder="item.stayed_at"
                      outline
                      @update:modelValue="runBusy(updateStayedAt, route.params.id, $event)"
                    />
                    -->
                  </div>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.arrived') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link
                    class="link"
                    :to="{ name: 'moorage-details', params: { id: item.departed_to_moorage_id } }"
                  >
                    {{ item.departed_to_moorage_name }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.arrival') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link class="link" :to="{ name: 'log-details', params: { id: item.arrived_log_id } }">
                    {{ dateFormatUTC(item.arrived) }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.departed') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link
                    class="link"
                    :to="{ name: 'moorage-details', params: { id: item.arrived_from_moorage_id } }"
                  >
                    {{ item.arrived_from_moorage_name }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.departure') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link class="link" :to="{ name: 'log-details', params: { id: item.departed_log_id } }">
                    {{ dateFormatUTC(item.departed) }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('stays.stay.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <VaTextarea
                    v-model="formData.notes"
                    outline
                    placeholder="Note"
                    type="textarea"
                    @change="handleSubmit"
                  />
                </dd>
              </dl>
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <div class="row justify-end">
                <!--
                <div class="flex">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
                </div>
                -->
              </div>
            </va-form>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import PostgSail from '../../services/api-client'
  import { useCacheStore } from '../../stores/cache-store'
  import { dateFormatUTC, durationFormatHours, durationI18nHours, durationI18nDays } from '../../utils/dateFormatter.js'
  import Map from '../../components/maps/leafletMapMoorages.vue'
  import { asBusy } from '../../utils/handleExports'
  import StayAt from '../../components/SelectStayAt.vue'
  import { useToast } from 'vuestic-ui'
  const { init: initToast } = useToast()

  import stays from '../../data/stays.json'

  const route = useRoute()
  const CacheStore = useCacheStore()
  const isBusy = ref(false)
  const apiError = ref(null)
  const updateError = ref(null)
  const apiData = reactive({ row: null })
  const formData = reactive({
    isValid: true,
    name: null,
    notes: null,
  })

  const item = computed(() => {
    return apiData.row
      ? {
          id: apiData.row.id,
          name: apiData.row.name,
          moorage: apiData.row.moorage,
          moorage_id: apiData.row.moorage_id,
          duration: apiData.row.duration,
          stayed_at: apiData.row.stayed_at,
          departed: apiData.row.departed,
          arrived: apiData.row.arrived,
          arrived_from_moorage_id: apiData.row.arrived_from_moorage_id,
          departed_to_moorage_id: apiData.row.departed_to_moorage_id,
          departed_log_id: apiData.row.departed_log_id,
          arrived_log_id: apiData.row.arrived_log_id,
          departed_to_moorage_name: apiData.row.departed_to_moorage_name,
          arrived_from_moorage_name: apiData.row.arrived_from_moorage_name,
          notes: apiData.row.notes,
          stayed_at_id: apiData.row.stayed_at_id,
        }
      : {}
  })
  const mapGeoJsonFeatures = computed(() => {
    return item.value && item.value.geoJson && item.value.geoJson.features && Array.isArray(item.value.geoJson.features)
      ? item.value.geoJson.features
      : []
  })
  const canSubmit = computed(() => {
    const isDirty = item.value.name !== formData.name || item.value.notes !== formData.notes
    return !isBusy.value && formData.isValid && isDirty
  })
  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    //const api = new PostgSail()
    const id = route.params.id
    try {
      //const response = await CacheStore.api.stay_get(id)
      const response = await CacheStore.getAPI('stay_get', id)
      if (Array.isArray(response)) {
        apiData.row = response[0]
        formData.name = apiData.row.name || null
        formData.notes = apiData.row.notes || null
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
      if (!import.meta.env.PROD) {
        console.warn('Get sample data from local json...', apiError.value)
        const row = stays.find((row) => row.id == route.params.id)
        apiData.row = row
      }
    } finally {
      isBusy.value = false
    }
  })

  const handleSubmit = async () => {
    isBusy.value = true
    updateError.value = null

    const api = new PostgSail()
    const id = route.params.id
    const payload = {
      name: formData.name,
      notes: formData.notes,
    }
    try {
      const response = await api.stay_update(id, payload)
      //console.log(response)
      if (response) {
        console.log('stay_update success', response)
        localStorage.removeItem('cache')
      } else {
        throw { response }
      }
    } catch (err) {
      console.log('stay_update failed', err.message ?? err)
      updateError.value = err
    } finally {
      initToast({
        message: updateError.value ? `Error updating stay entry` : `Successfully updated stay entry`,
        position: 'top-right',
        color: updateError.value ? 'warning' : 'success',
      })
      isBusy.value = false
    }
  }

  function runBusy(fn, ...args) {
    asBusy(isBusy, apiError, fn, ...args)
  }

  function updateStayedAt(update_stayed_at, id) {
    // runBusy handles isBusy & apiError
    console.log('updateStayedAt', update_stayed_at, id)
    if (update_stayed_at && update_stayed_at > 0) {
      new PostgSail()
        .stay_update(id, { stay_code: update_stayed_at })
        .then((response) => {
          console.log('updateStayedAt success', response)
          // Clean CacheStore and force refresh
          CacheStore.stays = []
          CacheStore.stays_get = []
          CacheStore.store_ttl = null
        })
        .catch((err) => {
          console.log('updateStayedAt failed', err.message ?? err)
          //throw err.message ?? err
        })
    }
  }
</script>

<style lang="scss" scoped>
  .dl-details {
    > dt:nth-child(4n + 3) {
      &,
      & + dd {
        background-color: var(--va-background);
      }
    }
  }
  .inputbox {
    background: white;
    border: 1px solid #ccc;
  }
</style>
