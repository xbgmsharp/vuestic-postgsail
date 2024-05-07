<template>
  <div>
    <va-card class="mb-3">
      <va-card-content>
        <Map style="width: 100%; height: 40vh" :map-zoom="13" :moorage-map-id="Number.parseInt(route.params.id)" />
      </va-card-content>
    </va-card>
    <va-card class="mb-3">
      <va-card-title>{{ $t('moorages.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <div class="mb-3 my-3">
          <!--
          <template v-if="!isBusy && item">
            <lMap :geo-json-features="mapGeoJsonFeatures" style="width: 100%; height: 350px" />
          </template>
          -->
        </div>
        <va-inner-loading :loading="isBusy">
          <template v-if="item">
            <va-form ref="form" @submit.prevent="handleSubmit" @validation="formData.isValid = $event">
              <dl class="dl-details row mb-3">
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.moorage') }}</dt>
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
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.departed') }}</dt>
                <dd class="flex">
                  <div>
                    <StayAt
                      v-if="item.default_stay_id"
                      :id="parseInt(route.params.id)"
                      :data="parseInt(item.default_stay_id)"
                      @clickFromChildComponent="updateDefaultStay($event)"
                    />
                    <!--
                    <va-select
                      v-model="stayed_at_options[item.default_stay_id]"
                      :options="stayed_at_options"
                      outline
                      class="mb-6"
                      @update:modelValue="runBusy(updateDefaultStay, route.params.id, $event)"
                    />
                    -->
                  </div>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.home') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-switch v-model="item.home" size="small" @update:modelValue="runBusy(updateHome, $event)" />
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.stayed_at') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link class="va-link link" :to="{ name: 'moorage-stays', params: { id: item.id } }">
                    {{ durationI18nDaysHours(item.total_duration) }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.arrivals') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <router-link
                    class="va-link link"
                    :to="{ name: 'moorage-arrivals-departures', params: { id: item.id } }"
                  >
                    {{ item.arrivals_departures }}
                  </router-link>
                </dd>
                <dt class="flex xs12 md6 pa-2 va-text-bold">{{ $t('moorages.moorage.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <VaTextarea v-model="formData.notes" outline placeholder="Note" @change="handleSubmit" />
                </dd>
              </dl>
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <div>
                <!--
                <div class="flex">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
                </div>
                -->
                <div class="flex flex-row pa-2">
                  <va-button color="danger" @click="handleDelete">Delete</va-button>
                </div>
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
  import { useGlobalStore } from '../../stores/global-store'
  import Map from '../../components/maps/leafletMapMoorages.vue'
  import { asBusy } from '../../utils/handleExports'
  import StayAt from '../../components/SelectStayAt.vue'
  import { durationFormatDays, durationI18nDaysHours } from '../../utils/dateFormatter.js'
  import { useModal, useToast } from 'vuestic-ui'
  const { confirm } = useModal()
  const { init: initToast } = useToast()

  import moorages from '../../data/moorages.json'

  const route = useRoute()
  const CacheStore = useCacheStore()
  const GlobalStore = useGlobalStore()
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
          default_stay: apiData.row.default_stay,
          home: apiData.row.home,
          total_stay: apiData.row.total_stay,
          total_duration: apiData.row.total_duration,
          arrivals_departures: apiData.row.arrivals_departures,
          notes: apiData.row.notes,
          default_stay_id: apiData.row.default_stay_id,
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
      //const response = await api.moorage_get(id)
      const response = await CacheStore.getAPI('moorage_get', id)
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
        const row = moorages.find((row) => row.id == route.params.id)
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
      const response = await api.moorage_update(id, payload)
      //console.log(response)
      if (response) {
        console.log('moorage_update success', response)
        // Clean CacheStore and force refresh
        CacheStore.moorages = []
        CacheStore.moorages_get = []
        CacheStore.store_ttl = null
        return true
      } else {
        throw { response }
      }
    } catch (err) {
      console.log('moorage_update failed', err.message ?? err)
      updateError.value = err
    } finally {
      initToast({
        message: updateError.value ? `Error updating moorage entry` : `Successfully updated moorage entry`,
        position: 'top-right',
        color: updateError.value ? 'warning' : 'success',
      })
      isBusy.value = false
    }
  }

  function runBusy(fn, ...args) {
    asBusy(isBusy, apiError, fn, ...args)
  }

  function updateDefaultStay(update_default_stay) {
    // runBusy handles isBusy & apiError
    console.log('updateDefaultStay', update_default_stay)
    const id = route.params.id
    if (update_default_stay && update_default_stay > 0) {
      new PostgSail()
        .moorage_update(id, { stay_code: update_default_stay })
        .then((response) => {
          console.log('updateDefaultStay success', response)
          // Clean CacheStore and force refresh
          CacheStore.moorages = []
          CacheStore.moorages_get = []
          CacheStore.store_ttl = null
          return true
        })
        .catch((err) => {
          console.log('updateDefaultStay failed', err.message ?? err)
          updateError.value = err
        })
        .finally(() => {
          initToast({
            message: updateError.value ? `Error updating moorage entry` : `Successfully updated moorage entry`,
            position: 'top-right',
            color: updateError.value ? 'warning' : 'success',
          })
          isBusy.value = false
        })
    }
  }

  function updateHome(new_home) {
    // runBusy handles isBusy & apiError
    console.log('updateHome', new_home)
    const id = route.params.id
    new PostgSail()
      .moorage_update(id, { home_flag: new_home })
      .then((response) => {
        console.log('updateHome success', response)
        // Clean CacheStore and force refresh
        CacheStore.moorages = []
        CacheStore.moorages_get = []
        CacheStore.store_ttl = null
        return true
      })
      .catch((err) => {
        console.log('updateHome failed', err.message ?? err)
        updateError.value = err
      })
  }

  const handleDelete = async () => {
    isBusy.value = true
    updateError.value = null
    let canDelete = false

    const modal_result = await confirm({
      message:
        'This will permanently delete the Moorage Entry and any associated Logs and Stays. Do you really want to continue?',
      title: 'Are you sure?',
      okText: 'Yes, I agree',
      cancelText: 'No, keep my data',
    })
    if (modal_result) {
      canDelete = true
      if (GlobalStore.readOnly) {
        initToast({
          message: `Demo account readonly`,
          position: 'top-right',
          color: 'warning',
        })
        return false
      }
    } else {
      isBusy.value = false
      initToast('Operation cancel')
    }

    if (!canDelete) return

    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.moorage_delete(id)
      if (response) {
        console.log('moorage_delete success', response)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('moorage_delete failed', response)
      updateError.value = response.message
    } finally {
      isBusy.value = false
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
