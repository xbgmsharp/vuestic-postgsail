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
              <!-- Name: differs → sync button, missing → SignalK note -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-900 dark:text-white">
                  {{ $t('boats.boat.name') }}
                </dt>
                <dd class="text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>{{ item.name || '-' }}</span>

                  <template v-if="item.name_differs">
                    <va-chip color="warning" size="small" outline>
                      <va-icon name="fa-warning" size="small" class="mr-1" />
                      {{ $t('boats.boat.differs_from_signalk') }}
                    </va-chip>
                    <VaButton size="small" :loading="isSyncing" @click="handleSyncIdentity">
                      {{ $t('boats.boat.sync_metadata') }}
                    </VaButton>
                  </template>

                  <va-alert
                    v-if="item.name_missing && item.registered_name"
                    color="info"
                    outline
                    dense
                    class="w-full mt-1 text-sm"
                  >
                    {{ $t('boats.boat.signalk_registered_prefix') }}
                    <code class="px-1 rounded bg-gray-200 dark:bg-gray-700">{{ item.registered_name }}</code>
                    — {{ $t('boats.boat.signalk_set_prefix') }}
                    <code class="px-1 rounded bg-gray-200 dark:bg-gray-700">self.name</code>
                  </va-alert>
                </dd>
              </div>

              <!-- MMSI: differs → sync button, missing → SignalK note -->
              <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                <dt class="font-semibold text-gray-900 dark:text-white">
                  {{ $t('boats.boat.mmsi') }}
                </dt>
                <dd class="text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
                  <span>{{ item.mmsi || '-' }}</span>

                  <template v-if="item.mmsi_differs">
                    <va-chip color="warning" size="small" outline>
                      <va-icon name="fa-warning" size="small" class="mr-1" />
                      {{ $t('boats.boat.differs_from_signalk') }}
                    </va-chip>
                    <VaButton size="small" :loading="isSyncing" @click="handleSyncIdentity">
                      {{ $t('boats.boat.sync_metadata') }}
                    </VaButton>
                  </template>

                  <va-alert
                    v-if="item.mmsi_missing && item.registered_mmsi"
                    color="info"
                    outline
                    dense
                    class="w-full mt-1 text-sm"
                  >
                    {{ $t('boats.boat.signalk_registered_prefix') }}
                    <code class="px-1 rounded bg-gray-200 dark:bg-gray-700">{{ item.registered_mmsi }}</code>
                    — {{ $t('boats.boat.signalk_set_prefix') }}
                    <code class="px-1 rounded bg-gray-200 dark:bg-gray-700">self.mmsi</code>
                  </va-alert>
                </dd>
              </div>

              <!-- Generic optional metadata fields: missing → soft inline hint pointing to SignalK AND specs lookup -->
              <template v-for="(label, key) in boatFields" :key="key">
                <div class="hover:bg-gray-100 dark:hover:bg-gray-800 p-3 rounded transition">
                  <dt class="font-semibold text-gray-900 dark:text-white">
                    {{ $t(label) }}
                  </dt>
                  <dd class="text-gray-800 dark:text-white">
                    <template v-if="item[key] !== null && item[key] !== undefined && item[key] !== ''">
                      {{ item[key] }}
                    </template>
                    <template v-else-if="signalkPaths[key]">
                      <span class="text-gray-500 dark:text-gray-400 text-sm italic flex items-center gap-1 flex-wrap">
                        <va-icon name="fa-info-circle" size="small" class="not-italic" />
                        {{ $t('boats.boat.signalk_missing_generic', { field: $t(label) }) }}
                        <code class="px-1 rounded bg-gray-200 dark:bg-gray-700 not-italic">{{
                          signalkPaths[key]
                        }}</code>
                        <span class="not-italic">{{ $t('boats.boat.or') }}</span>
                        <router-link
                          :to="{ name: 'boat-specifications' }"
                          class="text-blue-600 hover:underline dark:text-blue-400 not-italic"
                        >
                          {{ $t('boats.boat.lookup_specs') }}
                        </router-link>
                      </span>
                    </template>
                    <template v-else>-</template>
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
                      :color="item.has_config ? 'success' : 'warning'"
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
  import { computed, ref, reactive, onMounted } from 'vue'
  import { storeToRefs } from 'pinia'
  import { setAppTitle } from '../../utils/app.js'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import lMap from '../../components/maps/leafletMap.vue'
  import PhotoUploader from '../../components/PhotoUploader.vue'
  import { useToast } from 'vuestic-ui'
  import { useVesselStore } from '../../stores/vessel-store'

  import vesselData from '../../data/boat.json'

  const { t } = useI18n()
  const image_support = import.meta.env.VITE_S3_URL ? true : false
  const isBusy = ref(false)
  const isSyncing = ref(false)
  const apiError = ref(null)
  const apiData = reactive({ row: null })
  const formData = ref({ make_model: '' })
  const isEditing = ref(false)
  const { init: initToast } = useToast()

  // NOTE: assumes vessel-store exposes `id`. Adjust to the real getter/prop name.
  const VesselStore = useVesselStore()
  const { vesselId } = storeToRefs(VesselStore)

  // Name & MMSI are rendered as dedicated blocks (differs → sync button, missing → SignalK note).
  const boatFields = {
    lastContact: 'boats.boat.last_contact',
    firstContact: 'boats.boat.first_contact',
    createdAt: 'boats.boat.created_at',
    beam: 'boats.boat.beam',
    height: 'boats.boat.height',
    length: 'boats.boat.length',
    ship_type: 'boats.boat.ship_type',
    platform: 'boats.boat.platform',
  }

  // SignalK paths for metadata fields that can be missing and pointed back to SignalK.
  // NOTE: verify these against your signalk-postgsail plugin's actual field mapping —
  // aisShipType/airHeight/length.overall are the conventional SignalK design.* paths,
  // but confirm against what the plugin actually reads. `platform` intentionally
  // omitted — it describes the plugin's host, not a SignalK-reported vessel attribute.
  const signalkPaths = {
    ship_type: 'self.design.aisShipType',
    beam: 'self.design.beam',
    height: 'self.design.airHeight',
    length: 'self.design.length.overall',
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
          has_config: apiData.row.has_config,
          images: apiData.row.images,
          spec: apiData.row.spec,
          spec_url: apiData.row?.spec?.permalink ? apiData.row.spec.permalink : null,
          name_differs: apiData.row.name_differs ? apiData.row.name_differs : false,
          mmsi_differs: apiData.row.mmsi_differs ? apiData.row.mmsi_differs : false,
          name_missing: apiData.row.name_missing ? apiData.row.name_missing : false,
          mmsi_missing: apiData.row.mmsi_missing ? apiData.row.mmsi_missing : false,
          registered_name: apiData.row.registered_name,
          registered_mmsi: apiData.row.registered_mmsi,
        }
      : {}
  })

  const mapGeoJsonFeatures = computed(() => {
    return item.value.geoJson
  })

  const offline_msg = computed(() => {
    return !item.value.offline ? 'Online' : 'Offline'
  })
  const configuration_msg = computed(() => {
    return item.value.has_config ? 'Present' : 'Missing'
  })
  const polar_msg = computed(() => {
    return item.value.has_polar ? 'Present' : 'Missing'
  })
  const spec_msg = computed(() => {
    return item.value.spec_url ? 'Present' : 'Missing'
  })

  async function loadVessel() {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      // vessels_get() hits a table view scoped by vessel id and returns an array of rows.
      const response = await api.vessels_get(vesselId.value)
      if (response && response.length > 0) {
        apiData.row = response[0]
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
      apiError.value = response?.message ?? err
      if (!import.meta.env.PROD) {
        console.warn('Fallback using sample data from local json...', apiError.value)
        const row = vesselData.vessel
        apiData.row = row
      }
    } finally {
      isBusy.value = false
    }
  }

  onMounted(loadVessel)

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
      if (response) {
        apiError.value = null
        return true
      } else {
        throw { response }
      }
    } catch (err) {
      apiError.value = err.message ?? err
    } finally {
      initToast({
        message: apiError.value ? `Error updating make&model` : `Successfully updated make&model`,
        position: 'top-right',
        color: apiError.value ? 'warning' : 'success',
      })
      isBusy.value = false
      isEditing.value = false
    }
  }

  // Backs both the name and mmsi "sync" buttons — one identity-sync call covers
  // whichever of the two currently differs from SignalK.
  const handleSyncIdentity = async () => {
    isSyncing.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.vessel_sync({ _vessel_id: vesselId.value })
      if (response) {
        await loadVessel()
        initToast({
          message: t('boats.boat.sync_success'),
          position: 'top-right',
          color: 'success',
        })
      } else {
        throw { response }
      }
    } catch (err) {
      apiError.value = err.message ?? err
      initToast({
        message: t('boats.boat.sync_error'),
        position: 'top-right',
        color: 'warning',
      })
    } finally {
      isSyncing.value = false
    }
  }

  const handlePhotoUpdated = async (updatedPhoto) => {
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
