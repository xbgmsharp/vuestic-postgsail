<template>
  <div>
    <va-card class="mb-3">
      <va-card-content>
        <Map style="width: 100%; height: 40vh" :map_zoom="13" :moorage_map_id="Number.parseInt(route.params.id)" />
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
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.moorage') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input
                    v-model="formData.name"
                    placeholder="Name"
                    outline
                    :rules="[(value) => (value && value.length > 0) || 'Field is required']"
                  />
                </dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.departed') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <div>
                    <va-select
                      v-model="stayed_at_options[item.default_stay_id]"
                      :placeholder="value"
                      :options="stayed_at_options"
                      outline
                      class="mb-6"
                    />
                  </div>
                </dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.home') }}</dt>
                <dd class="flex xs12 md6 pa-2">
                  <va-switch v-model="item.home" size="small" />
                </dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.stayed_at') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.total_stay }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.arrivals') }}</dt>
                <dd class="flex xs12 md6 pa-2">{{ item.arrivals_departures }}</dd>
                <dt class="flex xs12 md6 pa-2 text--bold">{{ $t('moorages.moorage.note') }}</dt>
                <dd class="flex xs12 md6 pa-1">
                  <va-input v-model="formData.notes" outline type="textarea" placeholder="Note" />
                </dd>
              </dl>
              <template v-if="updateError">
                <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ updateError }}</va-alert>
              </template>
              <div class="row justify--end">
                <div class="flex">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
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
  import { dateFormat } from '../../utils/dateFormatter.js'
  import { distanceFormat } from '../../utils/distanceFormatter.js'
  import { speedFormat } from '../../utils/speedFormatter.js'
  import Map from '../../components/maps/leafletMapMoorages.vue'

  import moorages from '../../data/moorages.json'

  const stayed_at_options = ref([
    {
      value: 1,
      text: 'Unknown',
    },
    {
      value: 2,
      text: 'Anchor',
    },
    {
      value: 3,
      text: 'Mooring Buoy',
    },
    {
      value: 4,
      text: 'Dock',
    },
  ])

  const route = useRoute()
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
          arrivals_departures: apiData.row.arrivals_departures,
          notes: apiData.row.notes,
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
    const api = new PostgSail()
    const id = route.params.id
    try {
      const response = await api.moorage_get(id)
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
      if (response.ok) {
        console.log('moorage_update success', response.status)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      console.log('moorage_update failed', response)
      updateError.value = response.data.message
    } finally {
      isBusy.value = false
    }
  }

  function updateDefaultStay(id, default_stay) {
    // runBusy handles isBusy & apiError
    console.log(default_stay)
    new PostgSail()
      .moorage_update(id, { stay_code: default_stay.value })
      .then((response) => {
        console.log('updateDefaultStay success', response)
      })
      .catch((err) => {
        console.log('updateDefaultStay failed', err.message ?? err)
        //throw err.message ?? err
      })
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
  .leaflet-maps-page {
    display: flex;
    flex-direction: column;

    .va-alert {
      flex: 0 0 auto;
      width: 100%;
    }

    .leaflet-maps-page__widget {
      flex: 1 1 auto;

      .leaflet-map {
        height: 100% !important;
      }
    }
  }
</style>
