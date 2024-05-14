<template>
  <div>
    <va-card>
      <va-card-title>{{ $t('boats.details.title') }}</va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
        </template>
        <va-inner-loading :loading="isBusy">
          <div class="mb-3 my-3">
            <template v-if="!isBusy && item.geoJson">
              <lMap id="boat-map" :geo-json-feature="mapGeoJsonFeatures" map-type="Satellite" :map-zoom="14" />
            </template>
          </div>
          <div class="mb-3 my-3" style="text-align: center">
            {{ $t('boats.boat.signalk') }}
          </div>
          <template v-if="item">
            <dl class="dl-details row">
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.name') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.name }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.mmsi') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.mmsi }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.last_contact') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.lastContact }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.first_contact') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.firstContact }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.created_at') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.createdAt }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.beam') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.beam }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.height') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.height }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.length') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.length }}</dd>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.country') }}</dt>
              <template v-if="item.country">
                <dd class="flex xs12 md6 pa-2">
                  {{ item.country }}
                  <va-icon :name="getFlagIcon(item.flag.toLocaleLowerCase(), 'small')" />
                </dd>
              </template>
              <template v-else>
                <dd class="flex xs12 md6 pa-2"></dd>
              </template>
              <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.ship_type') }}</dt>
              <dd class="flex xs12 md6 pa-2">{{ item.ship_type }}</dd>
              <template v-if="item.plugin_version">
                <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.plugin_version') }}</dt>
                <dd class="flex">
                  <template v-if="item.plugin_version === '0.3.1'">
                    <va-chip color="success" class="mr-6 mb-2">
                      {{ item.plugin_version }}
                    </va-chip> </template
                  ><template v-else>
                    <va-popover icon="warning" :message="$t('boats.messages.plugin_version')">
                      <va-chip color="warning" class="mr-6 mb-2">
                        {{ item.plugin_version }}
                      </va-chip>
                    </va-popover>
                  </template>
                </dd>
              </template>
              <template v-if="item.platform">
                <dt class="flex xs12 md6 pa-2 font-bold">{{ $t('boats.boat.platform') }}</dt>
                <dd class="flex">
                  {{ item.platform }}
                </dd>
              </template>
              <template v-if="item.mmsi">
                <dt class="flex xs12 md6 pa-2 font-bold">VesselFinder</dt>
                <dd class="flex xs12 md6 pa-2">
                  <a
                    :href="`https://www.vesselfinder.com/vessels?name=${item.mmsi}`"
                    target="_blank"
                    class="va-link link"
                    >VesselFinder <va-icon name="fa-external-link" size="small"
                  /></a>
                </dd>
                <dt class="flex xs12 md6 pa-2 font-bold">MarineVesselTraffic</dt>
                <dd class="flex xs12 md6 pa-2">
                  <a
                    :href="`https://www.marinevesseltraffic.com/2013/06/mmsi-number-search.html?mmsi=${item.mmsi}`"
                    target="_blank"
                    class="va-link link"
                    >MarineVesselTraffic <va-icon name="fa-external-link" size="small"
                  /></a>
                </dd>
              </template>
            </dl>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { setAppTitle } from '../../utils/app.js'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'

  import vesselData from '../../data/boat.json'

  const { t } = useI18n()

  const route = useRoute()
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiData = reactive({ row: null })

  const item = computed(() => {
    return apiData.row
      ? {
          mmsi: apiData.row.mmsi,
          name: apiData.row.name,
          firstContact: dateFormatUTC(apiData.row.first_contact),
          lastContact: dateFormatUTC(apiData.row.last_contact),
          createdAt: dateFormatUTC(apiData.row.created_at),
          geoJson: apiData.row.geojson,
          beam: apiData.row.beam,
          height: apiData.row.height,
          length: apiData.row.length,
          country: apiData.row.country,
          flag: apiData.row.alpha_2,
          ship_type: apiData.row.ship_type,
          plugin_version: apiData.row.plugin_version,
          platform: apiData.row.platform,
        }
      : {}
  })
  const mapGeoJsonFeatures = computed(() => {
    console.log('mapGeoJsonFeatures')
    console.log(`geoJson ${item.value.geoJson}`)
    return item.value.geoJson
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    //const mmsi = route.params.mmsi
    try {
      const response = await api.vessel_get()
      // API return null when vessel is pending metadata
      if (response && response.vessel) {
        apiData.row = response.vessel
        if (apiData.row.name) {
          document.title = setAppTitle(t('boats.details.title') + ': ' + apiData.row.name)
        }
        //console.log(`geoJson ${apiData.row.geojson}`)
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      apiError.value = response.message
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        const row = vesselData.find((row) => row.id == route.params.id)
        apiData.row = row
      }
    } finally {
      isBusy.value = false
    }
  })

  function getFlagIcon(code, size) {
    return `flag-icon-${code} ${size}`
  }
</script>

<style lang="scss">
  @import 'flag-icons/css/flag-icons.css';
  .dl-details {
    > dt:nth-child(4n + 3) {
      &,
      & + dd {
        background-color: var(--va-background);
      }
    }
  }
  #boat-map {
    width: 100%;
    height: 350px;
  }
</style>
