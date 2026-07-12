<script setup lang="ts">
  import { PropType, computed, ref } from 'vue'
  import { Trip, FormData } from '../types'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import { seaState, visibility } from '../../../utils/PostgSail'
  import { durationFormatHours, durationI18nHours } from '../../../utils/dateFormatter.js'
  import MySelect from '../../../components/vaSelect.vue'
  import PhotoUploaderModal from '../../../components/PhotoUploaderModal.vue'
  import PostgSail from '../../../services/api-client'
  import { useCacheStore } from '../../../stores/cache-store'
  import { useVesselStore } from '../../../stores/vessel-store'
  import { useToast } from 'vuestic-ui'

  const { init: initToast } = useToast()
  const { isLoggedIn, imageSupport } = useGlobalStore()
  const CacheStore = useCacheStore()
  const { vesselId } = useVesselStore()
  const { t } = useI18n()
  const route = useRoute()
  const props = defineProps({
    logbook: {
      type: Object as PropType<Trip>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<FormData>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'updated', log: Trip): void
  }>()

  // ---------------------------------------------------------------------------
  // Metrics display
  // ---------------------------------------------------------------------------
  // logbook.extra.metrics is a flat dot-namespaced bag, e.g.:
  //   "fuel.avg_lph", "sailing.duration", "tanks.fuel.0.currentLevel",
  //   "propulsion.port.revolutions.avg", "navigation.log", "fuel.source" (metadata)
  // Rather than dumping every key into one flat list, we bucket known
  // namespaces into dedicated mini-sections and fall back to a generic
  // list for anything unrecognized so new metric keys never silently vanish.

  const metrics = computed<Record<string, any>>(() => props.logbook.extra?.metrics ?? {})

  function formatMetricKey(key: string | number | symbol): string {
    const k = String(key)
    const parts = k.split('.')
    const meaningful = parts.slice(1).join(' ')
    return meaningful
      .replace(/([A-Z])/g, ' $1')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim()
  }

  function formatMetricValue(key: string | number | symbol, value: any): string {
    const k = String(key)
    if (typeof value === 'number') {
      if (k.includes('Level')) return (value * 100).toFixed(1) + ' %'
      if (k.includes('energy_wh')) return value.toFixed(0) + ' Wh'
      return value.toFixed(2)
    }
    return String(value)
  }

  // Keys already extracted and formatted as engineHours (propulsion.<engine>.runTime)
  function isEngineRunTime(key: string | number | symbol): boolean {
    const parts = String(key).split('.')
    return parts[0] === 'propulsion' && parts[parts.length - 1] === 'runTime'
  }

  // "*.source" keys describe provenance (which sensor/derivation produced a
  // value), not a metric worth its own row — always skip these.
  function isMetadataKey(key: string | number | symbol): boolean {
    return String(key).endsWith('.source')
  }

  // ISO 8601 duration ("PT4H25M58.537S") -> decimal hours, for durationFormatHours/durationI18nHours
  function parseIsoDurationToHours(iso: string): number {
    const match = iso.match(/^PT(?:([\d.]+)H)?(?:([\d.]+)M)?(?:([\d.]+)S)?$/)
    if (!match) return 0
    const h = parseFloat(match[1] || '0')
    const m = parseFloat(match[2] || '0')
    const s = parseFloat(match[3] || '0')
    return h + m / 60 + s / 3600
  }

  function formatDurationHours(iso: string): string {
    return `${durationFormatHours(iso)} ${durationI18nHours(iso)}`
  }

  const sailMotorSplit = computed(() => {
    const m = metrics.value
    if (m['sailing.duration'] == null && m['motoring.duration'] == null) return null
    const sailDist = Number(m['sailing.distance_nm'] ?? 0)
    const motorDist = Number(m['motoring.distance_nm'] ?? 0)
    const total = sailDist + motorDist || 1
    //console.log('sailMotorSplit', { sailPct: (sailDist / total) * 100, motorPct: (motorDist / total) * 100 })
    return {
      sail: {
        distance: sailDist.toFixed(1),
        duration: m['sailing.duration'] ? formatDurationHours(m['sailing.duration']) : '—',
      },
      motor: {
        distance: motorDist.toFixed(1),
        duration: m['motoring.duration'] ? formatDurationHours(m['motoring.duration']) : '—',
      },
      sailPct: (sailDist / total) * 100,
      motorPct: (motorDist / total) * 100,
    }
  })

  // Fuel summary (fuel.avg_lph, fuel.avg_lpnm, fuel.consumed_l)
  const fuelMetrics = computed(() => {
    const m = metrics.value
    if (m['fuel.consumed_l'] == null && m['fuel.avg_lph'] == null && m['fuel.avg_lpnm'] == null) return null
    return {
      consumed: m['fuel.consumed_l'] != null ? Number(m['fuel.consumed_l']).toFixed(1) : null,
      avgLph: m['fuel.avg_lph'] != null ? Number(m['fuel.avg_lph']).toFixed(2) : null,
      avgLpnm: m['fuel.avg_lpnm'] != null ? Number(m['fuel.avg_lpnm']).toFixed(2) : null,
    }
  })

  // Tank levels: tanks.<type>.<instance>.currentLevel
  const TANK_LABELS: Record<string, string> = {
    fuel: t('logs.log.tank_fuel') || 'Fuel',
    freshWater: t('logs.log.tank_fresh_water') || 'Fresh Water',
  }
  const tankMetrics = computed(() => {
    const m = metrics.value
    return Object.entries(m)
      .filter(([key]) => /^tanks\.\w+\.\d+\.currentLevel$/.test(key))
      .map(([key, value]) => {
        const match = key.match(/^tanks\.(\w+)\.(\d+)\.currentLevel$/)!
        const [, type, instance] = match
        return {
          key,
          label: `${TANK_LABELS[type] ?? type} #${instance}`,
          value: Number(value) * 100,
        }
      })
  })

  // Propulsion detail beyond runTime: propulsion.<engine>.revolutions.(avg|max)
  const propulsionMetrics = computed(() => {
    const m = metrics.value
    return Object.entries(m)
      .filter(([key]) => /^propulsion\.\w+\.revolutions\.(avg|max)$/.test(key))
      .map(([key, value]) => {
        const match = key.match(/^propulsion\.(\w+)\.revolutions\.(avg|max)$/)!
        const [, engine, stat] = match
        const statLabel = stat === 'avg' ? t('logs.log.avg') || 'avg' : t('logs.log.max') || 'max'
        return {
          key,
          label: `${engine.charAt(0).toUpperCase()}${engine.slice(1)} RPM (${statLabel})`,
          value: `${value} rpm`,
        }
      })
  })

  // Anything not claimed by a section above and not pure metadata
  const HANDLED_PATTERNS = [
    /^sailing\./,
    /^motoring\./,
    /^sailing_motoring\./,
    /^fuel\./,
    /^tanks\./,
    /^propulsion\./,
    /^navigation\.log$/,
  ]
  const unhandledMetrics = computed(() => {
    const m = metrics.value
    return Object.entries(m)
      .filter(([key]) => !isMetadataKey(key) && !isEngineRunTime(key) && !HANDLED_PATTERNS.some((p) => p.test(key)))
      .map(([key, value]) => ({ key, value }))
  })

  const hasAnyMetrics = computed(() => !!props.logbook.engineHours?.length || Object.keys(metrics.value).length > 0)

  // ---------------------------------------------------------------------------
  // Observations (sea state / visibility / cloud coverage)
  // ---------------------------------------------------------------------------
  const handleSeaState = async (new_sea_state: number, obj: { value: number; text: string }) => {
    console.log('handleSeaState new_sea_state', new_sea_state, obj)
    if (new_sea_state >= 0) {
      console.log('handleSeaState obj:', obj.value + ', text:' + obj.text)
      var result_obj: any = {}
      result_obj.seaState = new_sea_state
      updateObservations(result_obj)
    }
  }
  const handleVisibility = async (new_visibility: number, obj: { value: number; text: string }) => {
    console.log('handleVisibility', new_visibility, obj)
    if (new_visibility >= 0) {
      console.log('handleVisibility:', obj.value + ', text:' + obj.text)
      var result_obj: any = {}
      result_obj.visibility = new_visibility
      updateObservations(result_obj)
    }
  }

  const cloudCoverage = ref(props.logbook.cloudCoverage || -1)
  const sliderLabel = computed(() => `${cloudCoverage.value}/8`)
  const handleCloudCoverage = async (new_cloudCoverage: number) => {
    console.log('handleCloudCoverage : ', new_cloudCoverage)
    var obj: any = {}
    obj.cloudCoverage = new_cloudCoverage
    updateObservations(obj)
    cloudCoverage.value = new_cloudCoverage
  }
  function updateObservations(new_obs: number) {
    // runBusy handles isBusy & apiError
    console.log('updateObservations', new_obs)
    const id = route.params.id
    new PostgSail()
      .update_observations({ _id: id, observations: { observations: new_obs } })
      .then(async (response) => {
        console.log('updateObservations success', response)
        // Clean CacheStore and force refresh
        await CacheStore.resetCache()
      })
      .catch((err) => {
        console.log('updateObservations failed', err.message ?? err)
        //throw err.message ?? err
      })
  }

  const selectedLog = ref(null)
  const showPhotoModal = ref(false)
  function openPhotoModal(log: any) {
    selectedLog.value = log
    showPhotoModal.value = true
  }
  const handlePhotoUpdated = (updatedPhoto: any) => {
    showPhotoModal.value = false
    console.log('handlePhotoUpdated', updatedPhoto)
    emit('updated', {
      ...props.logbook,
      has_images: updatedPhoto.has_images,
      images: updatedPhoto.images,
    })
  }

  async function handleDelete(log: any, image: any) {
    console.debug('Removing image')
    const api = new PostgSail()
    const payload = {
      _image_id: image.id,
      _id: log.id,
      _type: 'logbook',
      _operation: 'delete',
      _vessel_id: vesselId,
    }
    try {
      const response = await api.image_update(payload)
      //console.log(response)
      if (response) {
        console.log('Image update success', response)
      } else {
        throw { response }
      }
    } catch (err) {
      console.error('Image update error:', err)
      initToast({
        message: 'Error deleting image',
        position: 'top-right',
        color: 'error',
      })
    } finally {
      // Step 1: Get presigned DELETE URL from backend
      const deleteUrl = await api.getPresignedDeleteUrl({
        _image_type: image.type,
        _id: log.id,
        _type: 'logbook',
        _vessel_id: vesselId,
        _idx: image.id, // Index of images array for stays, moorages, logbooks
      })
      // Step 2: Delete the file directly
      const deleteResult = await fetch(deleteUrl, {
        method: 'DELETE',
      })

      if (!deleteResult.ok) {
        console.error('Delete failed:', deleteResult.statusText)
        //throw new Error(`Delete failed: ${deleteResult.statusText}`)
      }
      // Filter out the deleted image
      const updatedImages = props.logbook.images.filter((img: any) => img.id !== image.id)
      emit('updated', {
        ...props.logbook,
        has_images: updatedImages.length > 0,
        images: updatedImages,
      })
      initToast({
        message: 'Successfully deleted image',
        position: 'top-right',
        color: 'success',
      })
    }
  }
  //console.debug('Observations props.logbook', props.logbook.images)

  const viewerOpen = ref(false)
  const currentImageIndex = ref(0)
  const swipeOffset = ref(0)
  const touchStartX = ref(0)
  const touchCurrentX = ref(0)

  const openImage = (index: number) => {
    currentImageIndex.value = index
    viewerOpen.value = true
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeImage = () => {
    viewerOpen.value = false
    swipeOffset.value = 0
    document.body.style.overflow = ''
  }

  const nextImage = () => {
    if (currentImageIndex.value < props.logbook.images.length - 1) {
      currentImageIndex.value++
    }
  }

  const previousImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  // Touch gesture handlers
  const handleTouchStart = (e: any) => {
    touchStartX.value = e.touches[0].clientX
  }

  const handleTouchMove = (e: any) => {
    touchCurrentX.value = e.touches[0].clientX
    swipeOffset.value = touchCurrentX.value - touchStartX.value
  }

  const handleTouchEnd = () => {
    const swipeThreshold = 50

    if (swipeOffset.value > swipeThreshold) {
      previousImage()
    } else if (swipeOffset.value < -swipeThreshold) {
      nextImage()
    }

    swipeOffset.value = 0
    touchStartX.value = 0
    touchCurrentX.value = 0
  }
  const handleDeleteCurrent = async () => {
    const currentImage = props.logbook.images[currentImageIndex.value]
    //console.log('handleDeleteCurrent', currentImage)

    // Call your delete handler
    await handleDelete(props.logbook, currentImage)

    // Adjust current index if needed
    if (currentImageIndex.value >= props.logbook.images.length) {
      currentImageIndex.value = Math.max(0, props.logbook.images.length - 1)
    }

    // Close viewer if no images left
    if (props.logbook.images.length === 0) {
      closeImage()
    }
  }
</script>

<template>
  <!-- observations section -->
  <div v-if="isLoggedIn && logbook.id > 0" class="">
    <!-- Trip metrics from extra.metrics -->
    <template v-if="hasAnyMetrics">
      <div class="text-xs uppercase mt-4 mb-2">{{ t('logs.log.metrics') }}</div>

      <!-- Sailing vs Motoring split -->
      <div v-if="sailMotorSplit" class="text-sm mb-3">
        <div class="flex justify-between mb-1">
          <span class="text-gray-600 dark:text-gray-400">⛵ {{ t('logs.log.sailing') }}</span>
          <span class="font-mono">{{ sailMotorSplit.sail.distance }} nm · {{ sailMotorSplit.sail.duration }}</span>
        </div>
        <div class="flex justify-between mb-1">
          <span class="text-gray-600 dark:text-gray-400">🛥️ {{ t('logs.log.motoring') }}</span>
          <span class="font-mono">{{ sailMotorSplit.motor.distance }} nm · {{ sailMotorSplit.motor.duration }}</span>
        </div>
        <div
          class="h-5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex mt-2 text-white text-xs font-mono"
        >
          <div
            v-if="sailMotorSplit.sailPct > 0"
            class="h-full flex items-center justify-center gap-1"
            :style="{ width: sailMotorSplit.sailPct + '%', backgroundColor: 'var(--va-primary)' }"
          >
            <span v-if="sailMotorSplit.sailPct >= 12">⛵ {{ sailMotorSplit.sailPct.toFixed(0) }}%</span>
          </div>
          <div
            v-if="sailMotorSplit.motorPct > 0"
            class="h-full flex items-center justify-center gap-1"
            :style="{ width: sailMotorSplit.motorPct + '%', backgroundColor: 'var(--va-warning)' }"
          >
            <span v-if="sailMotorSplit.motorPct >= 12">🛥️ {{ sailMotorSplit.motorPct.toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <!-- Engine hours + revolutions -->
      <dl
        v-if="logbook.engineHours?.length || propulsionMetrics.length"
        class="text-sm divide-y divide-gray-100 dark:divide-gray-700"
      >
        <div v-for="engine in logbook.engineHours" :key="engine.name" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ engine.name }} Run Time</dt>
          <dd class="font-mono text-right">{{ engine.duration }}</dd>
        </div>
        <div v-for="metric in propulsionMetrics" :key="metric.key" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ metric.label }}</dt>
          <dd class="font-mono text-right">{{ metric.value }}</dd>
        </div>
      </dl>

      <!-- Fuel -->
      <dl v-if="fuelMetrics" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
        <div v-if="fuelMetrics.consumed" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ t('logs.log.fuel_consumed') }}</dt>
          <dd class="font-mono text-right">{{ fuelMetrics.consumed }} L</dd>
        </div>
        <div v-if="fuelMetrics.avgLph" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ t('logs.log.fuel_avg_rate') }}</dt>
          <dd class="font-mono text-right">{{ fuelMetrics.avgLph }} L/h</dd>
        </div>
        <div v-if="fuelMetrics.avgLpnm" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ t('logs.log.fuel_avg_consumption') }}</dt>
          <dd class="font-mono text-right">{{ fuelMetrics.avgLpnm }} L/nm</dd>
        </div>
      </dl>

      <!-- Tanks -->
      <dl v-if="tankMetrics.length" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="tank in tankMetrics" :key="tank.key" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ tank.label }}</dt>
          <dd class="font-mono text-right" :class="{ 'text-warning': tank.value < 0 }">
            {{ tank.value > 0 ? '+' : '' }}{{ tank.value.toFixed(1) }}%
          </dd>
        </div>
      </dl>

      <!-- Navigation -->
      <dl v-if="metrics['navigation.log'] != null" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
        <div class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ t('logs.log.total_log') }}</dt>
          <dd class="font-mono text-right">{{ formatMetricValue('navigation.log', metrics['navigation.log']) }} nm</dd>
        </div>
      </dl>

      <!-- Fallback for unrecognized metric keys -->
      <dl v-if="unhandledMetrics.length" class="text-sm divide-y divide-gray-100 dark:divide-gray-700">
        <div v-for="{ key, value } in unhandledMetrics" :key="key" class="flex justify-between py-1">
          <dt class="text-gray-600 dark:text-gray-400">{{ formatMetricKey(key) }}</dt>
          <dd class="font-mono text-right">{{ formatMetricValue(key, value) }}</dd>
        </div>
      </dl>
    </template>

    <div class="h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex mt-2" />
    <div class="text-xs uppercase mt-4">{{ t('logs.log.sea_state') }}</div>
    <div class="text-sm">
      <template v-if="isLoggedIn">
        <MySelect
          v-if="props.logbook.seaState"
          :id="props.logbook.seaState"
          :key="props.logbook.seaState"
          :data="props.logbook.seaState"
          :object="seaState"
          @clickFromChildComponent="handleSeaState"
        />
      </template>
      <template v-else>
        {{ logbook.seaState }}
      </template>
    </div>
    <div class="text-xs uppercase my-2">{{ t('logs.log.cloud_coverage') }}</div>
    <div class="text-sm m-4">
      <template v-if="isLoggedIn">
        <va-slider
          v-model="cloudCoverage"
          stateful
          track-label-visible
          invert-label
          :min="-1"
          :max="8"
          :step="1"
          :label="sliderLabel"
          @update:modelValue="handleCloudCoverage"
        >
        </va-slider>
      </template>
      <template v-else>
        {{ cloudCoverage }}
      </template>
    </div>
    <div class="text-xs uppercase my-2">{{ t('logs.log.visibility') }}</div>
    <div class="text-sm">
      <template v-if="isLoggedIn">
        <MySelect
          v-if="logbook.visibility"
          :id="logbook.visibility"
          :key="logbook.visibility"
          :data="logbook.visibility"
          :object="visibility"
          @clickFromChildComponent="handleVisibility"
        />
      </template>
      <template v-else>
        {{ logbook.visibility }}
      </template>
    </div>
    <template v-if="imageSupport">
      <div class="h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex mt-2" />
      <div class="text-xs uppercase my-2 flex items-center justify-between">
        <span>{{ $t('logs.log.photos') }}</span>
        <va-icon
          name="photo_camera"
          class="cursor-pointer hover:text-primary transition-colors"
          :title="t('photoUploader.select_photo')"
          @click="openPhotoModal(logbook)"
        />
      </div>

      <div v-if="logbook.images && logbook.images.length > 0">
        <!-- Horizontal scrollable gallery -->
        <div class="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          <div
            v-for="(image, index) in logbook.images"
            :key="image.id"
            class="relative flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 snap-center"
            @click="openImage(index)"
          >
            <img
              :src="image.url"
              :alt="`Image ${index + 1}`"
              class="w-full h-full object-cover rounded-lg cursor-pointer"
            />
            <!-- Delete button -->
            <VaButton
              icon="delete"
              size="small"
              color="danger"
              class="absolute top-2 right-2 shadow-lg"
              :title="t('photoUploader.delete')"
              @click.stop="handleDelete(logbook, image)"
            />
          </div>
        </div>

        <!-- Mobile-friendly image viewer -->
        <Transition name="slide-up">
          <div
            v-if="viewerOpen"
            class="fixed inset-0 z-50 bg-black"
            @touchstart="handleTouchStart"
            @touchmove="handleTouchMove"
            @touchend="handleTouchEnd"
          >
            <!-- Header -->
            <div
              class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between z-10"
            >
              <span class="text-white text-sm"> {{ currentImageIndex + 1 }} / {{ logbook.images.length }} </span>
              <div class="flex items-center gap-4">
                <!-- Delete button in viewer -->
                <VaButton
                  icon="delete"
                  size="small"
                  color="danger"
                  class="shadow-lg"
                  :title="t('photoUploader.delete')"
                  @click="handleDeleteCurrent"
                />
                <!-- Close button -->
                <button class="text-white text-3xl" @click="closeImage">&times;</button>
              </div>
            </div>

            <!-- Image container with swipe support -->
            <div v-if="currentImageIndex !== null" class="h-full flex items-center justify-center px-4">
              <img
                :src="logbook.images[currentImageIndex].url"
                class="max-w-full max-h-full object-contain"
                :style="{ transform: `translateX(${swipeOffset}px)` }"
              />
            </div>

            <!-- Navigation dots -->
            <div v-if="logbook.images.length > 1" class="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
              <button
                v-for="(image, index) in logbook.images"
                :key="index"
                class="w-2 h-2 rounded-full transition-all"
                :class="index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'"
                @click="currentImageIndex = index"
              />
            </div>

            <!-- Desktop navigation arrows -->
            <button
              v-if="logbook.images.length > 1"
              class="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
              @click="previousImage"
            >
              &#8249;
            </button>

            <button
              v-if="logbook.images.length > 1"
              class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
              @click="nextImage"
            >
              &#8250;
            </button>
          </div>
        </Transition>
      </div>

      <!-- Empty state -->
      <div
        v-else
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        @click="openPhotoModal(logbook)"
      >
        <va-icon name="add_photo_alternate" :size="48" class="text-gray-400 mb-2" />
        <p class="text-sm text-gray-500">{{ t('photoUploader.no_photos') }}</p>
      </div>
    </template>
  </div>
  <PhotoUploaderModal
    v-if="selectedLog"
    v-model="showPhotoModal"
    :item="selectedLog"
    type="logbook"
    @updated="handlePhotoUpdated"
  />
</template>

<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: transform 0.3s ease-out;
  }

  .slide-up-enter-from {
    transform: translateY(100%);
  }

  .slide-up-leave-to {
    transform: translateY(100%);
  }
</style>
