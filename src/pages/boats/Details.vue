<template>
  <div class="p-4 dark:text-white">
    <va-card class="shadow-lg rounded-lg">
      <va-card-content class="mb-4">
        <!-- Map -->
        <template v-if="!isBusy && item.geoJson">
          <l-map id="boat-map" :geo-json-feature="mapGeoJsonFeatures" map-type="Satellite" :map-zoom="14" />
        </template>
      </va-card-content>
    </va-card>
    <va-card class="p-4 dark:text-white">
      <va-card-title class="text-xl font-bold dark:text-white">
        {{ $t('boats.details.title') }}
      </va-card-title>
      <va-card-content>
        <template v-if="apiError">
          <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
        </template>

        <va-inner-loading :loading="isBusy">
          <!-- Signalk Message -->
          <div class="mb-4 text-center text-gray-700 dark:text-gray-300 text-base font-medium">
            {{ $t('boats.boat.signalk') }}
          </div>

          <!-- Details Grid -->
          <template v-if="item">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-md md:text-base">
              <template v-for="(label, key) in boatFields" :key="key">
                <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t(label) }}
                  </dt>
                  <dd class="text-gray-800 dark:text-white">
                    {{ item[key] || '-' }}
                  </dd>
                </div>
              </template>

              <!-- Country with flag -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.country') }}
                </dt>
                <dd class="text-gray-700 dark:text-white flex items-center gap-2">
                  <span>{{ item.country || '-' }}</span>
                  <va-icon v-if="item.flag" :name="getFlagIcon(item.flag.toLocaleLowerCase(), 'small')" />
                </dd>
              </div>

              <!-- Plugin Version with chip -->
              <div v-if="item.plugin_version" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.plugin_version') }}
                </dt>
                <dd class="text-gray-800 dark:text-white">
                  <a href="https://www.npmjs.com/package/signalk-postgsail" target="_blank">
                    <va-chip :color="item.plugin_version >= '0.4.1' ? 'success' : 'warning'" class="cursor-pointer">
                      {{ item.plugin_version }}
                    </va-chip>
                  </a>
                </dd>
              </div>

              <!-- VesselFinder & MarineVesselTraffic -->
              <div v-if="item.mmsi" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">VesselFinder & MarineVesselTraffic</dt>
                <dd class="text-gray-800 dark:text-white">
                  <a
                    :href="`https://www.vesselfinder.com/vessels?name=${item.mmsi}`"
                    target="_blank"
                    class="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    VesselFinder
                    <va-icon name="fa-external-link" size="small" />
                  </a>
                  <br />
                  <a
                    :href="`https://www.marinevesseltraffic.com/2013/06/mmsi-number-search.html?mmsi=${item.mmsi}`"
                    target="_blank"
                    class="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    MarineVesselTraffic
                    <va-icon name="fa-external-link" size="small" />
                  </a>
                </dd>
              </div>

              <!-- Specifications -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.spec.title') }}
                </dt>
                <dd class="text-gray-800 dark:text-white">
                  <a :href="item.spec_url" target="_blank" class="text-blue-600 hover:underline dark:text-blue-400">
                    SailboatData.com
                    <va-icon name="fa-external-link" size="small" />
                  </a>
                  <br />
                  <router-link :to="{ name: 'boat-specifications' }">
                    <va-chip
                      :color="item.spec_url ? 'success' : 'warning'"
                      class="cursor-pointer group-hover:shadow-md transition-all"
                    >
                      {{ spec_msg }}
                      <va-icon name="edit" size="small" class="ml-1" />
                    </va-chip>
                  </router-link>
                </dd>
              </div>

              <!-- Offline -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.status') }}
                </dt>
                <dd class="text-gray-800 dark:text-white">
                  <router-link :to="{ name: 'monitoring' }">
                    <va-chip
                      :color="!item.offline ? 'success' : 'warning'"
                      class="cursor-pointer group-hover:shadow-md transition-all"
                    >
                      {{ offline_msg }}
                      <va-icon name="edit" size="small" class="ml-1" />
                    </va-chip>
                  </router-link>
                </dd>
              </div>

              <!-- Configuration -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.configuration') }}
                </dt>
                <dd class="text-gray-800 dark:text-white">
                  <router-link :to="{ name: 'boat-mapping' }">
                    <va-chip
                      :color="item.configuration ? 'success' : 'warning'"
                      class="cursor-pointer group-hover:shadow-md transition-all"
                    >
                      {{ configuration_msg }}
                      <va-icon name="edit" size="small" class="ml-1" />
                    </va-chip>
                  </router-link>
                </dd>
              </div>

              <!-- Make & Model -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.make_model') }}
                </dt>
                <dd>
                  <VaValue>
                    <vaInput
                      v-if="isEditing"
                      v-model="formData.make_model"
                      outline
                      class="w-full md:w-2/3 max-w-md"
                      @change="handleSubmit"
                    />
                    <span v-else>{{ formData.make_model }}</span>
                    <VaButton
                      :icon="isEditing ? 'save' : 'edit'"
                      preset="plain"
                      size="medium"
                      class="ml-2"
                      @click="toggleEdit"
                    />
                  </VaValue>
                </dd>
              </div>

              <!-- Polar -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-800 dark:text-white">
                  {{ $t('boats.boat.polar.title') }}
                </dt>
                <dd class="text-gray-800 dark:text-white">
                  <router-link :to="{ name: 'boat-polar' }">
                    <va-chip
                      :color="item.has_polar ? 'success' : 'warning'"
                      class="cursor-pointer group-hover:shadow-md transition-all"
                    >
                      {{ polar_msg }}
                      <va-icon name="edit" size="small" class="ml-1" />
                    </va-chip>
                  </router-link>
                </dd>
              </div>

              <!-- Photo -->
              <template v-if="image_support">
                <div class="col-span-full mt-6 p-3 rounded transition hover:bg-gray-100 dark:hover:bg-gray-800">
                  <dt class="font-semibold text-gray-800 dark:text-white">
                    {{ $t('boats.boat.photo') }}
                  </dt>
                  <dd class="mt-2">
                    <PhotoUploader :item="item" type="vessel" @updated="handlePhotoUpdated" />
                  </dd>
                </div>
              </template>
            </dl>
          </template>
        </va-inner-loading>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
  import { setAppTitle } from '../../utils/app.js'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'
  import PhotoUploader from '../../components/PhotoUploader.vue'
  import { useToast } from 'vuestic-ui'

  import vesselData from '../../data/boat.json'

  const { t } = useI18n()
  const image_support = import.meta.env.VITE_S3_URL ? true : false
  const isBusy = ref(false)
  const apiError = ref(null)
  const apiData = reactive({ row: null })
  const formData = ref({ make_model: '' })
  const isEditing = ref(false)
  const { init: initToast } = useToast()
  const boatFields = {
    name: 'boats.boat.name',
    mmsi: 'boats.boat.mmsi',
    lastContact: 'boats.boat.last_contact',
    firstContact: 'boats.boat.first_contact',
    createdAt: 'boats.boat.created_at',
    beam: 'boats.boat.beam',
    height: 'boats.boat.height',
    length: 'boats.boat.length',
    ship_type: 'boats.boat.ship_type',
    platform: 'boats.boat.platform',
  }

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
          offline: apiData.row.offline,
          configuration: apiData.row.configuration,
          image_url: apiData.row.has_images ? apiData.row.image_url : null,
          image_updated_at: apiData.row.image_updated_at ? dateFormatUTC(apiData.row.image_updated_at) : null,
          make_model: apiData.row.make_model,
          has_polar: apiData.row.has_polar,
          has_images: apiData.row.has_images,
          images: apiData.row.images,
          spec: apiData.row.spec,
          spec_url: apiData.row?.spec?.permalink ? apiData.row.spec.permalink : null,
        }
      : {}
  })
  const mapGeoJsonFeatures = computed(() => {
    console.log('mapGeoJsonFeatures')
    console.log(`geoJson ${item.value.geoJson}`)
    return item.value.geoJson
  })

  const offline_msg = computed(() => {
    return !item.value.offline ? 'Online' : 'Offline'
  })
  const configuration_msg = computed(() => {
    return item.value.configuration ? 'Present' : 'Missing'
  })
  const polar_msg = computed(() => {
    return item.value.has_polar ? 'Present' : 'Missing'
  })
  const spec_msg = computed(() => {
    return item.value.spec_url ? 'Present' : 'Missing'
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.vessel_get()
      // API return null when vessel is pending metadata
      if (response && response.vessel) {
        apiData.row = response.vessel
        if (apiData.row.name) {
          document.title = setAppTitle(t('boats.details.title') + ': ' + apiData.row.name)
        }
        if (apiData.row.make_model) {
          formData.value.make_model = apiData.row.make_model
        }
      } else {
        throw { response }
      }
    } catch (err) {
      const { response } = err
      apiError.value = response.message
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        const row = vesselData.vessel
        apiData.row = row
      }
    } finally {
      isBusy.value = false
    }
  })

  function getFlagIcon(code, size) {
    return `flag-icon-${code} ${size}`
  }

  function toggleEdit() {
    isEditing.value = !isEditing.value
  }

  const handleSubmit = async () => {
    isBusy.value = true
    apiError.value = null

    const api = new PostgSail()
    const payload = {
      userdata: {
        make_model: formData.value.make_model,
      },
    }
    try {
      const response = await api.vessel_update(payload)
      //console.log(response)
      if (response) {
        console.log('make&model  success', response)
        apiError.value = null
        return true
      } else {
        throw { response }
      }
    } catch (err) {
      console.log('make&model failed', err.message ?? err)
      apiError.value = err
    } finally {
      initToast({
        message: apiError.value ? `Error updating make&model` : `Successfully updated make&model`,
        position: 'top-right',
        color: apiError.value ? 'warning' : 'success',
      })
      isBusy.value = false
      // After saving, exit edit mode
      isEditing.value = false
    }
  }

  const handlePhotoUpdated = async (updatedPhoto) => {
    console.log('handlePhotoUpdated', updatedPhoto)
    apiData.row = {
      ...apiData.row,
      has_images: updatedPhoto.has_images,
      image_url: updatedPhoto.image_url,
      images: updatedPhoto.images,
    }
  }
</script>

<style lang="scss">
  @import 'flag-icons/css/flag-icons.css';
  #boat-map {
    width: 100%;
    height: 350px;
  }
</style>
