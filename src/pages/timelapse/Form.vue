<template>
  <div>
    <va-card class="flex flex-col space-y-6 md:space-y-4">
      <va-card-title class="text-2xl font-semibold">
        {{ $t('timelapse.customize') }}
      </va-card-title>
      <va-card-content class="overflow-x-hidden">
        <va-form ref="formData" @submit.prevent="onsubmit">
          <div class="space-y-6">
            <!-- Trip Selection Section -->
            <section class="border-b pb-6 border-[var(--va-background-border)]">
              <div class="flex items-center gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium">{{ $t('timelapse.choosetrips') }}</h3>
                  <p class="text-sm opacity-60 mt-1 break-words">Select specific trips for your replay</p>
                </div>
                <va-switch v-model="choose_trips" size="small" class="flex-shrink-0" />
              </div>

              <transition name="fade">
                <div v-if="choose_trips" class="space-y-4 mt-4 overflow-x-hidden">
                  <div class="w-full">
                    <label class="block text-sm font-medium mb-2">
                      {{ $t('timelapse.start') }}
                    </label>
                    <div class="w-full">
                      <MySelect
                        v-if="mylogs"
                        :id="parseInt(start_trip)"
                        key="start_trip"
                        :data="formData.start_log"
                        :object="mylogs"
                        class="w-full"
                        @clickFromChildComponent="handleStart"
                      />
                    </div>
                  </div>
                  <div class="w-full">
                    <label class="block text-sm font-medium mb-2">
                      {{ $t('timelapse.end') }}
                    </label>
                    <div class="w-full">
                      <MySelect
                        v-if="mylogs"
                        :id="parseInt(end_trip)"
                        key="end_trip"
                        :data="formData.end_log"
                        :object="mylogs"
                        class="w-full"
                        @clickFromChildComponent="handleEnd"
                      />
                    </div>
                  </div>
                </div>
              </transition>
            </section>

            <!-- Appearance Section -->
            <section class="border-b pb-6 border-[var(--va-background-border)]">
              <h3 class="text-lg font-medium mb-4">Appearance</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-x-hidden">
                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.basemap') }}
                  </label>
                  <MySelect
                    v-if="mapTypes"
                    :id="mapIdx"
                    key="mapTypes"
                    :data="mapIdx"
                    :object="mapTypes"
                    class="w-full"
                    @clickFromChildComponent="handleMap"
                  />
                </div>

                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.boattype') }}
                  </label>
                  <MySelect
                    v-if="boatTypes"
                    :id="boatIdx"
                    key="boatTypes"
                    :data="boatIdx"
                    :object="boatTypes"
                    class="w-full"
                    @clickFromChildComponent="handleBoatType"
                  />
                </div>

                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.trackcolor') }}
                  </label>
                  <MySelect
                    v-if="colors"
                    key="colors"
                    :data="color"
                    :object="colors"
                    class="w-full"
                    @clickFromChildComponent="handleColor"
                  />
                </div>

                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.zoom') }}
                  </label>
                  <MySelect
                    v-if="formData"
                    :id="formData.zoom"
                    key="zoom"
                    :data="formData.zoom"
                    :object="zooms"
                    class="w-full"
                    @clickFromChildComponent="handleZoom"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <va-card class="flex items-center gap-4 p-4" outlined>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ $t('timelapse.overlay') }}</p>
                    <p class="text-xs opacity-60 truncate">Show moorage overlay</p>
                  </div>
                  <va-switch v-model="overlay" size="small" class="flex-shrink-0" @click="handleOverlay" />
                </va-card>

                <va-card class="flex items-center gap-4 p-4" outlined>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate">{{ $t('timelapse.instruments') }}</p>
                    <p class="text-xs opacity-60 truncate">Display instrument panel</p>
                  </div>
                  <va-switch v-model="instruments" size="small" class="flex-shrink-0" @click="handleInstruments" />
                </va-card>
              </div>
            </section>

            <!-- Deck.gl 3D Options Section -->
            <section class="border-b pb-6 border-[var(--va-background-border)]">
              <div class="flex items-center gap-4 mb-4">
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium">3D Visualization</h3>
                  <p class="text-sm opacity-60 mt-1 break-words">Enhanced 3D rendering with deck.gl</p>
                </div>
                <va-switch v-model="enable3d" size="small" class="flex-shrink-0" />
              </div>

              <transition name="fade">
                <div v-if="enable3d" class="space-y-4 mt-4 overflow-x-hidden">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="min-w-0">
                      <label class="block text-sm font-medium mb-2"> Camera View Mode </label>
                      <MySelect
                        v-if="viewModes"
                        :id="viewModeIdx"
                        key="viewModes"
                        :data="viewModeIdx"
                        :object="viewModes"
                        class="w-full"
                        @clickFromChildComponent="handleViewMode"
                      />
                    </div>

                    <div class="min-w-0">
                      <label class="block text-sm font-medium mb-2"> Camera Pitch (Tilt) </label>
                      <MySelect
                        v-if="pitchOptions"
                        :id="pitchIdx"
                        key="pitchOptions"
                        :data="pitchIdx"
                        :object="pitchOptions"
                        class="w-full"
                        @clickFromChildComponent="handlePitch"
                      />
                    </div>
                  </div>
                </div>
              </transition>
            </section>

            <!-- Animation Settings Section -->
            <section class="border-b pb-6 border-[var(--va-background-border)]">
              <h3 class="text-lg font-medium mb-4">Animation Settings</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.anim') }}
                  </label>
                  <MySelect
                    v-if="formData"
                    :id="formData.speed"
                    key="speeds"
                    :data="formData.speed"
                    :object="speeds"
                    class="w-full"
                    @clickFromChildComponent="handleSpeed"
                  />
                </div>

                <div class="min-w-0">
                  <label class="block text-sm font-medium mb-2">
                    {{ $t('timelapse.delay') }}
                  </label>
                  <MySelect
                    :id="formData.delay"
                    key="delay"
                    :data="formData.delay"
                    :object="delays"
                    class="w-full"
                    @clickFromChildComponent="handleDelay"
                  />
                </div>
              </div>
            </section>

            <!-- Export Section -->
            <section class="border-b pb-6 border-[var(--va-background-border)]">
              <h3 class="text-lg font-medium mb-4">{{ $t('logs.log.export') }}</h3>
              <div class="flex flex-wrap gap-3">
                <va-button preset="secondary" size="medium" @click="handleGPX(formData)">
                  <va-icon name="gpx" class="mr-2" />
                  GPX
                </va-button>
                <va-button preset="secondary" size="medium" @click="handleGeoJSON(formData)">
                  <va-icon name="geojson" class="mr-2" />
                  GeoJSON
                </va-button>
                <va-button preset="secondary" size="medium" @click="handleKML(formData)">
                  <va-icon name="kml" class="mr-2" />
                  KML
                </va-button>
                <va-button preset="secondary" size="medium" @click="handlePNG(formData)">
                  <va-icon name="icon-png" class="mr-2" />
                  PNG
                </va-button>
                <va-button preset="secondary" size="medium" @click="handleLogbook(formData)">
                  <va-icon name="menu_book" class="mr-2" />
                  Logbook
                </va-button>
              </div>
            </section>

            <!-- Share Section -->
            <section class="pb-6">
              <h3 class="text-lg font-medium mb-4">{{ $t('logs.log.share') }}</h3>
              <div class="flex flex-wrap gap-3 items-center">
                <va-popover message="Shareable timelapse link" placement="top">
                  <va-button preset="secondary" size="medium" icon="link" @click="handleLink(formData)">
                    Copy Link
                  </va-button>
                </va-popover>

                <div class="flex flex-wrap gap-2">
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${timelapse_public_link}&t=${vesselName}'s Replay`"
                    target="_blank"
                    class="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                    style="background: var(--va-background-element)"
                  >
                    <va-icon name="facebook" :size="24" />
                  </a>

                  <template v-if="instagram">
                    <a
                      :href="`https://www.instagram.com/${instagram}/`"
                      target="_blank"
                      class="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                      style="background: var(--va-background-element)"
                    >
                      <va-icon name="instagram" :size="24" />
                    </a>
                  </template>

                  <a
                    :href="`https://twitter.com/intent/tweet?text=${vesselName}'s Replay&url=${timelapse_public_link}`"
                    target="_blank"
                    class="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                    style="background: var(--va-background-element)"
                  >
                    <va-icon name="x-twitter" :size="24" />
                  </a>

                  <a
                    :href="`mailto:?subject=${vesselName}'s Replay&body=${timelapse_public_link}`"
                    target="_blank"
                    class="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                    style="background: var(--va-background-element)"
                  >
                    <va-icon name="envelope" :size="24" />
                  </a>

                  <template v-if="website">
                    <a
                      :href="website"
                      target="_blank"
                      class="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:opacity-80 transition-opacity flex-shrink-0"
                      style="background: var(--va-background-element)"
                    >
                      <va-icon name="globe" :size="24" />
                    </a>
                  </template>
                </div>
              </div>
            </section>

            <!-- Action Buttons -->
            <div class="grid grid-cols-1 gap-4 pt-4">
              <va-button v-if="!enable3d" :to="timelapse_link" size="large" class="w-full">
                <va-icon name="play" class="mr-2" />
                {{ $t('logs.list.replay') }} (2D)
              </va-button>

              <template v-else>
                <va-button :to="timelapse3d_link" size="large" color="primary" class="w-full">
                  <va-icon name="play" class="mr-2" />
                  {{ $t('logs.list.replay') }} 3D
                </va-button>
              </template>
            </div>
          </div>
        </va-form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
  import { computed, reactive, ref, onMounted, watch } from 'vue'
  import { useCacheStore } from '../../stores/cache-store'
  import { storeToRefs } from 'pinia'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { baseMaps, boatMarkerTypes } from '../../components/maps/leafletHelpers.js'
  import MySelect from '../../components/vaSelect.vue'
  import { asBusy, handleExport } from '../../utils/handleExports'
  import { useGlobalStore } from '../../stores/global-store'
  const { publicVessel, instagram, website, publicTimelapse } = useGlobalStore()
  import { useVesselStore } from '../../stores/vessel-store'
  const { vesselName, vesselType, vesselId } = useVesselStore()
  import { useToast } from 'vuestic-ui'
  const { init: initToast } = useToast()

  const isBusy = ref(false)
  const apiError = ref(null)
  const CacheStore = useCacheStore()
  const { logs } = storeToRefs(CacheStore)
  const choose_trips = ref(false)
  const overlay = ref(true)
  const instruments = ref(true)
  const color = ref(0)
  const start_trip = ref(-1)
  const end_trip = ref(-1)
  const mylogs = ref([])

  // Deck.gl 3D Options
  const enable3d = ref(false)
  const globeView = ref(false)
  const ambientLight = ref(true)
  const smoothAnimation = ref(true)

  const defaultBoatType =
    vesselType === 'Sailing' ? 'SailboatSails' : vesselType === 'Pleasure Craft' ? 'Powerboat' : 'Dot'

  const formData = reactive({
    start_log: '',
    end_log: '',
    map_type: 'Satellite',
    boat_type: defaultBoatType,
    speed: 250,
    delay: 0,
    zoom: 13,
    color: 'dodgerblue',
    moorage_overlay: overlay.value,
    instruments: instruments.value,
    // Deck.gl options
    enable_3d: false,
    view_mode: 'standard',
    pitch: 0,
    arc_height: 0,
    trail_length: 50,
    globe_view: false,
    ambient_light: true,
    smooth_animation: true,
  })

  const timelapse_link = computed(() => {
    const searchParams = new URLSearchParams(formData)
    return `/timelapse?${searchParams.toString()}`
  })

  const timelapse3d_link = computed(() => {
    const params = { ...formData, enable_3d: true }
    const searchParams = new URLSearchParams(params)
    return `/timelapse3d?${searchParams.toString()}`
  })

  const timelapse_public_link = computed(() => {
    const searchParams = new URLSearchParams(formData)
    return `${window.location.protocol}//${window.location.host}/${publicVessel}/timelapse?${searchParams.toString()}`
  })

  const mapIdx = 0
  const mapTypes = Object.keys(baseMaps()).map((key, index) => ({
    value: index,
    text: key,
  }))

  const boatIdx = 1
  const boatTypes = Object.keys(boatMarkerTypes()).map((key, index) => ({
    value: index,
    text: key,
  }))

  const viewModeIdx = 0
  const viewModes = [
    { value: 0, text: 'Standard' },
    { value: 1, text: 'Follow Vessel' },
    { value: 2, text: 'Globe' },
  ]

  const pitchIdx = 60
  const pitchOptions = [
    { value: 0, text: '0° (Top Down)' },
    { value: 15, text: '15°' },
    { value: 30, text: '30°' },
    { value: 45, text: '45°' },
    { value: 60, text: '60°' },
  ]

  const speeds = [
    { value: 350, text: 'Snail Speed' },
    { value: 325, text: 'Very Slow' },
    { value: 300, text: 'Slow' },
    { value: 250, text: 'Normal' },
    { value: 150, text: 'Fast' },
    { value: 50, text: 'Very Fast' },
    { value: 10, text: 'Light Speed' },
  ]

  const zooms = [
    { value: 5, text: '5' },
    { value: 6, text: '6' },
    { value: 7, text: '7' },
    { value: 8, text: '8' },
    { value: 9, text: '9' },
    { value: 10, text: '10' },
    { value: 11, text: '11' },
    { value: 12, text: '12' },
    { value: 13, text: '13' },
  ]

  const delays = [
    { value: 0, text: 'None' },
    { value: 5, text: '5 seconds' },
    { value: 10, text: '10 seconds' },
  ]

  const colors = [
    { value: 0, text: 'Dodger Blue' },
    { value: 1, text: 'Green' },
    { value: 2, text: 'Yellow' },
    { value: 3, text: 'Red' },
    { value: 4, text: 'Orange' },
    { value: 5, text: 'Black' },
    { value: 6, text: 'Gray' },
    { value: 7, text: 'White' },
  ]

  watch(enable3d, (newVal) => {
    formData.enable_3d = newVal
  })

  onMounted(async () => {
    console.log('Timelapse Form onMounted')
    let formatDate = null
    mylogs.value.push({ value: 0, text: '' })
    for (let i = 0; i < logs.value.length; i++) {
      formatDate = dateFormatUTC(logs.value[i].started)
      mylogs.value.push({ value: logs.value[i].id, text: `${formatDate}: ${logs.value[i].name}` })
    }
  })

  const handleStart = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.start_log = obj.value
    }
  }

  const handleEnd = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.end_log = obj.value
    }
  }

  const handleMap = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.map_type = obj.text
    }
  }

  const handleBoatType = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.boat_type = obj.text
    }
  }

  const handleSpeed = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.speed = obj.value
    }
  }

  const handleColor = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.color = obj.text.toLowerCase().trim().replace(/\s+/gm, '')
    }
  }

  const handleZoom = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.zoom = obj.value
    }
  }

  const handleDelay = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.delay = obj.value
    }
  }

  const handleOverlay = async () => {
    formData.moorage_overlay = overlay.value
  }

  const handleInstruments = async () => {
    formData.instruments = instruments.value
  }

  const handleViewMode = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.view_mode = obj.text.toLowerCase().replace(/\s+/g, '_')
      if (obj.text === 'Globe') {
        globeView.value = true
        formData.globe_view = true
      }
    }
  }

  const handlePitch = async (new_value, obj) => {
    if (new_value >= 0) {
      formData.pitch = obj.value
    }
  }

  const onsubmit = () => {
    console.log('onsubmit', formData)
  }

  const handleLink = () => {
    initToast({
      message: `public shareable url copied to clipboard`,
      position: 'top-right',
      color: 'primary',
    })
    navigator.clipboard.writeText(timelapse_public_link.value)
  }

  const runBusy = (fn, ...args) => asBusy(isBusy, apiError, fn, ...args),
    handleGPX = (id) => handleExport_common('gpx', id),
    handleKML = (id) => handleExport_common('kml', id),
    handleGeoJSON = (id) => handleExport_common('geojson', id),
    handleExport_common = (format) => {
      if (formData.end_log < formData.start_log) {
        initToast({
          message: `Starting trip must be before ending trip.`,
          position: 'top-right',
          color: 'warning',
        })
        return
      }
      const payload = { end_log: formData.end_log, start_log: formData.start_log }
      let qs = null
      if (format === 'geojson') {
        qs = new URLSearchParams(removeNullValues(payload))
      }
      runBusy(handleExport, format, 'logs', qs ? qs : payload, `trip_${formData.start_log}_${formData.end_log}`)
    }

  const handlePNG = () => {
    if (!import.meta.env.VITE_QGIS_URL) {
      return null
    }
    //console.debug('handlePNG formData:', formData)
    if (formData.end_log < formData.start_log) {
      initToast({
        message: `Starting trip must be before ending trip.`,
        position: 'top-right',
        color: 'warning',
      })
      return
    }
    if (formData.end_log === '') {
      formData.end_log = formData.start_log
    }
    if (formData.map_type == 'Satellite') {
      window.open(`${import.meta.env.VITE_QGIS_URL}/trip_${vesselId}_${formData.start_log}_${formData.end_log}_sat.png`)
    } else {
      window.open(`${import.meta.env.VITE_QGIS_URL}/trip_${vesselId}_${formData.start_log}_${formData.end_log}.png`)
    }
  }

  const handleLogbook = () => {
    console.debug('handleLogbook formData:', formData)
    if (formData.end_log < formData.start_log) {
      initToast({
        message: `Starting trip must be before ending trip.`,
        position: 'top-right',
        color: 'warning',
      })
      return
    }
    if (formData.end_log === '') {
      formData.end_log = formData.start_log
    }
    const searchParams = new URLSearchParams(formData)
    window.open(`/logslapse?${searchParams.toString()}`)
  }

  function removeNullValues(obj) {
    for (let key in obj) {
      if (obj[key] === null) {
        delete obj[key]
      }
    }
    return obj
  }
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
