<template>
  <template v-if="apiError">
    <va-alert color="danger" outline class="mb-4">{{ $t('api.error') }}: {{ apiError }}</va-alert>
  </template>
  <va-inner-loading :loading="isBusy">
    <div class="explore-maps leaflet-map__full">
      <!-- Main content -->
      <div id="sidepanel" class="sidepanel" aria-label="side panel" aria-hidden="false">
        <div class="sidepanel-inner-wrapper">
          <nav class="sidepanel-tabs-wrapper" aria-label="sidepanel tab navigation">
            <ul class="sidepanel-tabs">
              <li class="sidepanel-tab">
                <a href="#" class="sidebar-tab-link" role="tab" data-tab-link="tab-1" @click="onLogsTabClick">
                  <va-icon name="timeline" />
                </a>
              </li>
              <li class="sidepanel-tab">
                <a href="#" class="sidebar-tab-link" role="tab" data-tab-link="tab-2" @click="onMooragesTabClick">
                  <va-icon name="anchor" />
                </a>
              </li>
              <li class="sidepanel-tab">
                <a href="#" class="sidebar-tab-link" role="tab" data-tab-link="tab-3" @click="onStaysTabClick">
                  <va-icon name="menu_book" />
                </a>
              </li>
            </ul>
          </nav>
          <div class="sidepanel-content-wrapper">
            <div class="sidepanel-content">
              <div id="logs-list" class="sidepanel-tab-content" data-tab-content="tab-1">
                <div v-if="logsList.length > 0">
                  <ol>
                    <li v-for="(log, index) in logsList" :key="index" class="mb-4 p-2 border-b">
                      <!-- Top row: Title + Stats -->
                      <div class="font-medium">
                        {{ index + 1 }}.
                        <a
                          class="va-link"
                          @mouseenter="onLogMouseEnter(log.properties.logIndex)"
                          @click="onLogClickNavigate(log.properties.centercoords, log.properties.logIndex)"
                        >
                          {{ log.properties.name }} • {{ durationFormatHours(log.properties.duration) }} h •
                          {{ distanceFormatMiles(log.properties.distance) }}
                        </a>
                      </div>

                      <!-- Bottom row: Image + Icons + Notes -->
                      <div class="mt-2 text-xs text-gray-600 flex flex-col gap-2">
                        <!-- Image or placeholder icon -->
                        <template v-if="imageSupport">
                          <div v-if="imageSupport" class="relative">
                            <va-icon
                              name="photo_camera"
                              class="cursor-pointer text-gray-400"
                              :title="t('photoUploader.select_photo')"
                              @click="openPhotoModal(log.properties, 'logbook')"
                            />
                            <div v-if="log.properties.images && log.properties.images.length > 0">
                              <!-- Horizontal scrollable gallery -->
                              <div class="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                <div
                                  v-for="(image, index) in log.properties.images"
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
                                    @click.stop="confirmDeleteCurrent(log.properties, 'logbook', image)"
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
                                    <span class="text-white text-sm">
                                      {{ currentImageIndex + 1 }} / {{ log.properties.images.length }}
                                    </span>
                                    <div class="flex items-center gap-4">
                                      <!-- Delete button in viewer -->
                                      <VaButton
                                        icon="delete"
                                        size="small"
                                        color="danger"
                                        class="shadow-lg"
                                        :title="t('photoUploader.delete')"
                                        @click="
                                          confirmDeleteCurrent(
                                            log.properties,
                                            'logbook',
                                            log.properties.images[currentImageIndex],
                                          )
                                        "
                                      />
                                      <!-- Close button -->
                                      <button type="button" class="text-white text-3xl" @click="closeImage">
                                        &times;
                                      </button>
                                    </div>
                                  </div>

                                  <!-- Image container with swipe support -->
                                  <div class="h-full flex items-center justify-center px-4">
                                    <img
                                      v-if="log.properties.images[currentImageIndex]"
                                      :src="log.properties.images[currentImageIndex].url"
                                      class="max-w-full max-h-full object-contain"
                                      :style="{ transform: `translateX(${swipeOffset}px)` }"
                                    />
                                  </div>

                                  <!-- Navigation dots -->
                                  <div
                                    v-if="log.properties.images.length > 1"
                                    class="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
                                  >
                                    <button
                                      v-for="(image, index) in log.properties.images"
                                      :key="index"
                                      type="button"
                                      class="w-2 h-2 rounded-full transition-all"
                                      :class="index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'"
                                      @click="currentImageIndex = index"
                                    />
                                  </div>

                                  <!-- Desktop navigation arrows -->
                                  <button
                                    v-if="log.properties.images.length > 1"
                                    type="button"
                                    class="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                    @click="previousImage(log.properties)"
                                  >
                                    &#8249;
                                  </button>

                                  <button
                                    v-if="log.properties.images.length > 1"
                                    type="button"
                                    class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                    @click="nextImage(log.properties)"
                                  >
                                    &#8250;
                                  </button>
                                </div>
                              </Transition>
                            </div>
                          </div>
                        </template>

                        <!-- Icons + Notes -->
                        <div class="flex items-start gap-2">
                          <va-icon
                            name="edit_note"
                            class="cursor-pointer"
                            :title="t('photoUploader.edit_note')"
                            @click="openEditModal(log.properties, 'logbook')"
                          />
                          <span class="leading-snug">{{ log.properties.notes }}</span>
                        </div>
                      </div>
                    </li>
                  </ol>
                  <div v-if="logsList.length > 0" class="stats-list">
                    <div class="stat-line">
                      <strong>{{ $t('stats.count') }}:</strong> {{ stats.logs.count }}
                    </div>
                    <div class="stat-line">
                      <strong>{{ $t('stats.sum_duration') }}:</strong> {{ stats.logs.duration }}
                    </div>
                    <div class="stat-line">
                      <strong>{{ $t('stats.sum_distance') }}:</strong> {{ stats.logs.distance }}
                    </div>
                  </div>
                </div>
              </div>
              <div id="moorages-list" class="sidepanel-tab-content" data-tab-content="tab-2">
                <div v-if="mooragesList.length > 0">
                  <ol>
                    <li v-for="(moorage, index) in mooragesList" :key="index">
                      <div class="line-item">
                        {{ index + 1 }}.
                        <img :src="moorage.properties.iconUrl" style="height: 24px; width: 24px" />
                        <a
                          class="va-link"
                          @mouseenter="onMoorageMouseEnter(moorage.properties.moorageIndex)"
                          @mouseleave="stopBouncingMarker(moorage.properties.moorageIndex)"
                          @click="onMoorageClickNavigate(moorage.geometry.coordinates, moorage.properties.moorageIndex)"
                          >{{ moorage.properties.name }}</a
                        >
                      </div>
                      <span class="text-xs text-gray-500">
                        <template v-if="imageSupport">
                          <!-- Image or placeholder icon -->
                          <div v-if="imageSupport" class="relative">
                            <template v-if="!moorage.properties.images">
                              <va-icon
                                name="photo_camera"
                                class="cursor-pointer text-gray-400"
                                :title="t('photoUploader.select_photo')"
                                @click="openPhotoModal(moorage.properties, 'moorage')"
                              />
                            </template>

                            <template v-else>
                              <va-icon
                                name="photo_camera"
                                class="cursor-pointer text-gray-400"
                                :title="t('photoUploader.select_photo')"
                                @click="openPhotoModal(moorage.properties, 'moorage')"
                              />
                              <div v-if="moorage.properties.images && moorage.properties.images.length > 0">
                                <!-- Horizontal scrollable gallery -->
                                <div class="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                  <div
                                    v-for="(image, index) in moorage.properties.images"
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
                                      @click.stop="confirmDeleteCurrent(moorage.properties, 'moorage', image)"
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
                                      <span class="text-white text-sm">
                                        {{ currentImageIndex + 1 }} / {{ moorage.properties.images.length }}
                                      </span>
                                      <div class="flex items-center gap-4">
                                        <!-- Delete button in viewer -->
                                        <VaButton
                                          icon="delete"
                                          size="small"
                                          color="danger"
                                          class="shadow-lg"
                                          :title="t('photoUploader.delete')"
                                          @click="
                                            confirmDeleteCurrent(
                                              moorage.properties,
                                              'moorage',
                                              moorage.properties.images[currentImageIndex],
                                            )
                                          "
                                        />
                                        <!-- Close button -->
                                        <button type="button" class="text-white text-3xl" @click="closeImage">
                                          &times;
                                        </button>
                                      </div>
                                    </div>

                                    <!-- Image container with swipe support -->
                                    <div class="h-full flex items-center justify-center px-4">
                                      <img
                                        v-if="moorage.properties.images[currentImageIndex]"
                                        :src="moorage.properties.images[currentImageIndex].url"
                                        class="max-w-full max-h-full object-contain"
                                        :style="{ transform: `translateX(${swipeOffset}px)` }"
                                      />
                                    </div>

                                    <!-- Navigation dots -->
                                    <div
                                      v-if="moorage.properties.images.length > 1"
                                      class="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
                                    >
                                      <button
                                        v-for="(image, index) in moorage.properties.images"
                                        :key="index"
                                        type="button"
                                        class="w-2 h-2 rounded-full transition-all"
                                        :class="index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'"
                                        @click="currentImageIndex = index"
                                      />
                                    </div>

                                    <!-- Desktop navigation arrows -->
                                    <button
                                      v-if="moorage.properties.images.length > 1"
                                      type="button"
                                      class="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                      @click="previousImage(moorage.properties)"
                                    >
                                      &#8249;
                                    </button>

                                    <button
                                      v-if="moorage.properties.images.length > 1"
                                      type="button"
                                      class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                      @click="nextImage(moorage.properties)"
                                    >
                                      &#8250;
                                    </button>
                                  </div>
                                </Transition>
                              </div>
                            </template>
                          </div>
                        </template>
                        <va-icon
                          name="edit_note"
                          :title="t('photoUploader.edit_note')"
                          @click="openEditModal(moorage.properties, 'moorage')"
                        />
                        {{ moorage.properties.notes }}
                      </span>
                    </li>
                  </ol>
                  <hr class="cool-hr" />
                  <div v-if="mooragesList.length > 0" class="stats-list">
                    <div class="stat-line">
                      <strong>{{ $t('stats.count') }}:</strong> {{ stats.moorages.count }}
                    </div>
                  </div>
                </div>
              </div>
              <div id="stays-list" class="sidepanel-tab-content" data-tab-content="tab-3">
                <div>
                  <div v-if="noteshistory.length > 0">
                    <ol>
                      <li v-for="(note, index) in noteshistory" :key="index" class="line-item">
                        <img :src="note.iconUrl" style="height: 24px; width: 24px" />
                        <div>
                          <a
                            class="va-link"
                            @mouseenter="onMoorageMouseEnter(note.moorage_id)"
                            @mouseleave="stopBouncingMarker(note.moorage_id)"
                            @click="navigateMoorage(note.coordinates, note.moorage_id)"
                          >
                            {{ note.stay_name }} ({{ note.arrived }})
                          </a>
                          <br />
                          <span>{{ note.dms }}</span>
                          <span class="text-xs text-gray-500">
                            <template v-if="imageSupport">
                              <!-- Image or placeholder icon -->
                              <div v-if="imageSupport" class="relative">
                                <template v-if="!note.images">
                                  <va-icon
                                    name="photo_camera"
                                    class="cursor-pointer text-gray-400"
                                    :title="t('photoUploader.select_photo')"
                                    @click="openPhotoModal(note, 'stay')"
                                  />
                                </template>

                                <template v-else>
                                  <va-icon
                                    name="photo_camera"
                                    class="cursor-pointer text-gray-400"
                                    :title="t('photoUploader.select_photo')"
                                    @click="openPhotoModal(note, 'stay')"
                                  />
                                  <div v-if="note.images && note.images.length > 0">
                                    <!-- Horizontal scrollable gallery -->
                                    <div class="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                                      <div
                                        v-for="(image, index) in note.images"
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
                                          @click.stop="confirmDeleteCurrent(note, 'stay', image)"
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
                                          <span class="text-white text-sm">
                                            {{ currentImageIndex + 1 }} / {{ note.images.length }}
                                          </span>
                                          <div class="flex items-center gap-4">
                                            <!-- Delete button in viewer -->
                                            <VaButton
                                              icon="delete"
                                              size="small"
                                              color="danger"
                                              class="shadow-lg"
                                              :title="t('photoUploader.delete')"
                                              @click="
                                                confirmDeleteCurrent(note, 'stay', note.images[currentImageIndex])
                                              "
                                            />
                                            <!-- Close button -->
                                            <button type="button" class="text-white text-3xl" @click="closeImage">
                                              &times;
                                            </button>
                                          </div>
                                        </div>

                                        <!-- Image container with swipe support -->
                                        <div class="h-full flex items-center justify-center px-4">
                                          <img
                                            v-if="note.images[currentImageIndex]"
                                            :src="note.images[currentImageIndex].url"
                                            class="max-w-full max-h-full object-contain"
                                            :style="{ transform: `translateX(${swipeOffset}px)` }"
                                          />
                                        </div>

                                        <!-- Navigation dots -->
                                        <div
                                          v-if="note.images.length > 1"
                                          class="absolute bottom-8 left-0 right-0 flex justify-center gap-2"
                                        >
                                          <button
                                            v-for="(image, index) in note.images"
                                            :key="index"
                                            type="button"
                                            class="w-2 h-2 rounded-full transition-all"
                                            :class="index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'"
                                            @click="currentImageIndex = index"
                                          />
                                        </div>

                                        <!-- Desktop navigation arrows -->
                                        <button
                                          v-if="note.images.length > 1"
                                          type="button"
                                          class="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                          @click="previousImage(note)"
                                        >
                                          &#8249;
                                        </button>

                                        <button
                                          v-if="note.images.length > 1"
                                          type="button"
                                          class="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition-colors"
                                          @click="nextImage(note)"
                                        >
                                          &#8250;
                                        </button>
                                      </div>
                                    </Transition>
                                  </div>
                                </template>
                              </div>
                            </template>
                            <va-icon
                              name="edit_note"
                              :title="t('photoUploader.edit_note')"
                              @click="openEditModal(note, 'stay')"
                            />
                            {{ note.stay_notes }}
                          </span>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidepanel-toggle-container">
          <button class="sidepanel-toggle-button" type="button" aria-label="toggle side panel"></button>
        </div>
      </div>
    </div>
    <div id="explore-map" class="leaflet-map"></div>
    <template v-if="logsSlider.length > 1">
      <div class="map-controls">
        <div class="date-slider">
          <va-slider
            v-model="filter.dateRange"
            :range="true"
            :min="0"
            :max="logsSlider.length - 1"
            :step="1"
            show-markers
            :tooltip="true"
            :tooltip-label="tooltipLabel"
          />
          {{ formattedDateRange }}
        </div>

        <div class="tag-selector py-2">
          <va-select
            v-model="filter.tags"
            :placeholder="$t('logs.list.filter.tags')"
            :options="logsTags"
            multiple
            text-by="text"
            style="width: 90%"
          >
            <template #content="{ value }">
              <va-chip
                v-for="chip in value"
                :key="chip.text"
                size="small"
                class="xs-chip mr-2"
                outline
                closeable
                @update:modelValue="deleteChip(chip)"
              >
                {{ chip }}
              </va-chip>
            </template>
          </va-select>
        </div>
      </div>
    </template>
  </va-inner-loading>

  <!-- Edit Note Modal -->
  <EditNoteModal
    v-if="showEditModal"
    v-model="showEditModal"
    :item="selectedData"
    :type="typeData"
    @close="showEditModal = false"
    @updated="handleNoteUpdated"
  />

  <!-- Photo Upload Modal -->
  <PhotoUploaderModal
    v-if="showPhotoModal"
    v-model="showPhotoModal"
    :item="selectedData"
    :type="typeData"
    @updated="handlePhotoUpdated"
  />
</template>

<script setup>
  /* eslint-disable */
  import { watchEffect, onMounted, ref, computed, watch, reactive, onBeforeUnmount, nextTick } from 'vue'
  import 'leaflet/dist/leaflet.css'
  import 'leaflet.sidepanel/dist/leaflet.sidepanel.css'
  import L from 'leaflet'
  import 'leaflet.sidepanel'
  import 'leaflet-rotatedmarker'
  import SmoothMarkerBouncing from 'leaflet.smooth_marker_bouncing'
  import 'leaflet.fullscreen'
  import { useToast } from 'vuestic-ui'
  const { init: initToast } = useToast()

  import PostgSail from '../../services/api-client'
  import {
    dateFormatUTC,
    durationFormatHours,
    durationHours,
    fromNow,
    durationFromNow,
  } from '../../utils/dateFormatter.js'
  import { distanceFormatMiles, distanceFormat, depthFormatI18n } from '../../utils/distanceFormatter.js'
  import { awaFormat, angleFormat } from '../../utils/angleFormatter.js'
  import { speedFormatKnots } from '../../utils/speedFormatter.js'
  import { stayed_at_options } from '../../utils/PostgSail.ts'
  import { kelvinToHuman } from '../../utils/temperatureFormatter.js'
  import { pascalToHectoPascal } from '../../utils/presureFormatter.js'
  import { floatToPercentage } from '../../utils/percentageFormatter.js'
  import { default as utils } from '../../utils/utils.js'
  import { decimalToDMS } from '../../utils/dms'
  import { baseMaps, overlayMaps, boatMarkerTypes } from './leafletHelpers.js'
  import { useRouter } from 'vue-router'

  import echartsProgress from '../../components/echarts/progress.vue'
  import echartsGauge from '../../components/echarts/gauge.vue'
  //import echartsPressure from '../../components/echarts/gaugePressure.vue'
  import echartsPressure from '../../components/echarts/timeseries.vue'

  import PhotoUploaderModal from '../PhotoUploaderModal.vue'
  import EditNoteModal from '../EditNoteModal.vue'

  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useCacheStore } from '../../stores/cache-store'
  import { useVesselStore } from '../../stores/vessel-store'

  const GlobalStore = useGlobalStore()
  const { isSidebarMinimized, currentTheme, imageSupport } = storeToRefs(GlobalStore)
  const { vesselName, vesselType, vesselModel, vesselImage, vesselId } = useVesselStore()

  const CacheStore = useCacheStore()
  const { mapGeoJSON } = storeToRefs(CacheStore)
  const { getMap } = CacheStore

  const router = useRouter()

  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  // Adds bouncing plugin code to the global L variable
  SmoothMarkerBouncing(L)
  // Sets options of bouncing of all markers
  L.Marker.setBouncingOptions({
    bounceHeight: 60, // height of the bouncing
    bounceSpeed: 54, // bouncing speed coefficient
    exclusive: true, // if this marker is bouncing all others must stop
  })

  const isBusy = ref(false)
  const apiError = ref(null)
  const apiSuccess = ref(null)
  const map = ref(null)
  const currentZoom = ref(7)
  const mooragesLayers = ref([])
  const mooragesMakers = ref([])
  const logsLayers = ref([])
  const mooragesList = ref([])
  const logsList = ref([])
  const mapBounds = ref(null)
  const filter = reactive({
    dateRange: [0, -1],
    tags: [],
  })
  const stats = reactive({
    logs: {
      count: 0,
      distance: 0,
      duration: 0,
    },
    moorages: {
      count: 0,
      duration: 0,
    },
  })
  const rowsData = ref([])

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null

    // Load cached map data if available
    await getMap()
    //console.debug('Explore map geojson', mapGeoJSON.value.logs_map, mapGeoJSON.value.moorages_map, mapGeoJSON.value.stays_map)
    const cached = localStorage.removeItem('map')

    isBusy.value = false
    isSidebarMinimized.value = true
    //console.log('Explore map geojson', api_geojson.value)
    // Extract the first coordinates as a center
    //const coords = api_geojson.value.features[0].geometry.coordinates[0]
    // Initialize map
    const mapContainer = document.getElementById('explore-map')
    if (!mapContainer) {
      console.error('Map container not found.')
      return
    }
    // No data to display
    if (
      (logsListFull.value && logsListFull.value.length === 0) ||
      (mooragesListFull.value && mooragesListFull.value.length === 0)
    ) {
      console.warn('No data available. empty map')
      isBusy.value = false
      isSidebarMinimized.value = false
      map.value = L.map(mapContainer).setView([0, 0], 1)
      const bMaps = baseMaps()
      bMaps['OpenStreetMap'].addTo(map.value)
      L.control
        .sidepanel('sidepanel', {
          panelPosition: 'left',
          hasTabs: true,
          tabsPosition: 'top',
          pushControls: true,
          darkMode: currentTheme.value === 'dark',
          startTab: 'tab-1',
        })
        .addTo(map.value)
      return
    }
    // Normal process
    map.value = L.map(mapContainer, {
      //center: [coords[1], coords[0]],
      zoom: currentZoom.value,
      zoomControl: false,
      easeLinearity: 0.35, // Lower = smoother panning
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      zoomAnimation: true,
      markerZoomAnimation: true,
    })
    // Track zoom level and hide/show labels based on zoom
    map.value.on('zoomend', () => {
      currentZoom.value = map.value.getZoom()
    })
    const bMaps = baseMaps()
    const oMaps = overlayMaps()
    bMaps['OpenStreetMap'].addTo(map.value)
    L.control.layers(bMaps, oMaps).addTo(map.value)
    // Zoom to bottomright
    L.control.zoom({ position: 'bottomright' }).addTo(map.value)
    // create a fullscreen button and add it to the map
    L.control
      .fullscreen({
        position: 'bottomright', // change the position of the button can be topleft, topright, bottomright or bottomleft, default topleft
        content: '<i class="va-icon material-icons">fullscreen</i>', // change the content of the button, can be HTML, default null
      })
      .addTo(map.value)
    // Add moorage layers (each Point as a separate layer)
    mooragesLayers.value = mooragesListFull.value.map((feature) => {
      //console.debug(feature)
      return L.geoJSON(feature, {
        pointToLayer: markerIcon,
        onEachFeature: onEachMoorageFeaturePopup,
      })
    })
    // Add log layers (each LineString as a separate layer)
    logsLayers.value = logsListFull.value.map((feature) => {
      //console.debug(feature)
      return L.geoJSON(feature, {
        style: function (feature) {
          return { color: random_rgb_dark(), weight: 3 } // Apply random color to each LineString
        },
        onEachFeature: onEachLogFeaturePopup,
      })
    })

    L.control
      .sidepanel('sidepanel', {
        panelPosition: 'left',
        hasTabs: true,
        tabsPosition: 'top',
        pushControls: true,
        darkMode: currentTheme.value === 'dark',
        startTab: 'tab-1',
      })
      .addTo(map.value)

    map.value.whenReady(function () {
      addResetViewControl()
      addResetFilterControl()
      addLogControl()
      const sidepanel = document.getElementById('sidepanel')

      // Watch class changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            if (sidepanel.classList.contains('opened')) {
              sidepanel.setAttribute('aria-hidden', 'false')
              // Sidebar has been opened
              console.debug('Sidebar opened — updating map')
              updateMap()
            } else {
              sidepanel.setAttribute('aria-hidden', 'true')
            }
          }
        })
      })

      observer.observe(sidepanel, { attributes: true })

      // Open sidepanel initially
      const toggleButton = document.querySelector('.sidepanel-toggle-button')
      if (toggleButton) toggleButton.click()
    })

    //observer.observe(document.getElementById('explore-map'))
    // Force map to recalculate size after initialization
    setTimeout(() => {
      if (map.value) {
        console.log('Invalidate map size after timeout')
        map.value.invalidateSize()
        const elm = document.getElementById('explore-map')
        console.debug('Leaflet map element size:', elm.getBoundingClientRect())
      }
    }, 300)

    // Add initial logs and moorages layer
    updateMap()
  }) // end onMounted

  const logsListFull = computed(() => {
    //console.log('logsListFull computed called', CacheStore.mapGeoJSON.logs_map)
    return CacheStore.mapGeoJSON.logs_map || []
  })
  const mooragesListFull = computed(() => {
    return CacheStore.mapGeoJSON.moorages_map || []
  })
  const api_stays_map = computed(() => {
    return CacheStore.mapGeoJSON.stays_map || []
  })
  /*
    // Extract all geometry Point from geojson to get a list of moorage geojson feature for map
    const mooragesListFull = computed(() => {
      if (!api_moorages_map.value) return []
      return api_moorages_map.value
        .filter((feature) => feature.geojson.geometry.type === 'Point')
        .sort((a, b) => b.geojson.geometry.coordinates[1] - a.geojson.geometry.coordinates[1]) // north to south
        .map((feature, index) => {
          feature.geojson.properties['moorageIndex'] = index // keep original index
          if (feature.geojson.properties.default_stay_id == 3) {
            feature.geojson.properties['iconUrl'] = '/mooring_icon.png'
          } else if (feature.geojson.properties.default_stay_id == 4) {
            feature.geojson.properties['iconUrl'] = '/dock_icon.png'
          } else {
            feature.geojson.properties['iconUrl'] = '/anchoricon.png'
          }
          return feature.geojson
        })
    })

    // Extract all geometry LineString from geojson to get a list of log geojson feature for map
    const logsListFull = computed(() => {
      if (!api_logs_map.value) return []
      return api_logs_map.value
        .filter((feature) => feature.geojson.geometry.type === 'LineString')
        .map((feature, index) => {
          feature.geojson.properties['logIndex'] = index // keep original index
          const midPoint = Math.round(feature.geojson.geometry.coordinates.length / 2)
          const centerLat = parseFloat(feature.geojson.geometry.coordinates[midPoint][1])
          const centerLng = parseFloat(feature.geojson.geometry.coordinates[midPoint][0])
          feature.geojson['properties']['centercoords'] = [centerLat, centerLng]
          return feature.geojson
        })
    })
  */
  // Extract all geometry LineString from geojson to get a list of log date for slider
  const logsSlider = computed(() => {
    if (!logsListFull.value) return []
    return logsListFull.value
      .filter((feature) => feature.geometry.type === 'LineString')
      .map((feature) => feature.properties.starttimestamp)
  })

  // Extract all geometry LineString from geojson to get a list of tags for filter
  const logsTags = computed(() => {
    if (!logsListFull.value) return []
    const tagSet = new Set()
    logsListFull.value
      .filter((feature) => feature.geometry?.type === 'LineString')
      .forEach((feature) => {
        const tags = feature.properties?.tags
        if (Array.isArray(tags)) {
          tags.forEach((tag) => tagSet.add(tag))
        }
      })
    return Array.from(tagSet).sort()
  })

  // Update map layers (Logs and moorages) and set bounds
  const updateMap = () => {
    if (!map.value) return

    // Remove all existing layers from map
    logsLayers.value.forEach((layer) => map.value.removeLayer(layer))
    mooragesLayers.value.forEach((layer) => map.value.removeLayer(layer))

    // Reset visible lists
    logsList.value = []
    mooragesList.value = []
    // Reset Stats
    stats.logs.count = 0
    stats.logs.duration = 0
    stats.logs.distance = 0
    stats.moorages.count = 0
    stats.moorages.duration = 0

    console.debug('filter.tags, filter.dateRange', filter.tags, filter.dateRange)
    console.debug('logsListFull', logsListFull.value)
    console.debug('mooragesListFull', mooragesListFull.value)

    // Get selected date range
    const [startIdx, endIdx] = filter.dateRange
    console.debug('start', startIdx, 'end', endIdx)
    if (endIdx === -1) {
      // If endIdx is -1, set it to the last index of logsListFull ts sShow all logs
      filter.dateRange = [0, logsListFull.value.length - 1]
      return
    }
    const logStart = new Date(logsListFull.value[startIdx].properties.starttimestamp)
    const logEnd = new Date(logsListFull.value[endIdx].properties.endtimestamp)
    console.debug('start', logsListFull.value[startIdx].properties.starttimestamp)
    console.debug('end', logsListFull.value[endIdx].properties.endtimestamp)
    // Track moorage IDs referenced by logs
    const referencedMoorageIds = new Set()

    // Add logs in range and tags
    for (let i = startIdx; i <= endIdx; i++) {
      const logFeature = logsListFull.value[i]
      // Extract tags from the feature
      const featureTags = logFeature.properties?.extra?.tags ?? []
      // If tag filter is active, check if any tag matches
      const matchesTags = filter.tags.length === 0 || featureTags.some((tag) => filter.tags.includes(tag))
      if (matchesTags && logsLayers.value[i]) {
        map.value.addLayer(logsLayers.value[i])
        logsList.value.push(logFeature)
        // Track referenced moorage IDs
        const fromId = logFeature.properties?._from_moorage_id || null
        const toId = logFeature.properties?._to_moorage_id || null
        if (fromId) referencedMoorageIds.add(fromId)
        if (toId) referencedMoorageIds.add(toId)
        stats.logs.count++
        stats.logs.duration += durationHours(logFeature.properties?.duration) || 0
        stats.logs.distance += logFeature.properties?.distance || 0
      }
    }
    console.debug('logsList', logsList.value.length)
    if (logsList.value.length === 0) {
      // If no logs are found, show a message or handle it accordingly
      console.warn('No logs found for the selected date range and tags. resetting...')
      filter.tags = [] // Reset tags
      filter.dateRange = [0, logsListFull.value.length - 1] // Reset range to the new limits
    }

    // Add moorages in range of the log. Bug the first moorage is never included as it is before the first log
    mooragesListFull.value.forEach((moorageFeature, i) => {
      const moorageId = moorageFeature.properties.id
      const moorageStart = new Date(moorageFeature.properties.stay_first_seen)
      const moorageEnd = new Date(moorageFeature.properties.stay_last_seen)
      // be aware of logs order, desc vs asc
      // Check if moorage is within the log date range and referenced by logs
      if (
        (moorageStart >= logEnd && moorageEnd <= logStart) ||
        referencedMoorageIds.has(moorageId) ||
        moorageFeature.properties.stay_first_seen === null ||
        moorageFeature.properties.stay_last_seen === null
      ) {
        if (mooragesLayers.value[i]) {
          mooragesList.value.push(moorageFeature)
          map.value.addLayer(mooragesLayers.value[i])
          stats.moorages.count++
          stats.moorages.duration += durationHours(moorageFeature.properties?.stays_sum_duration || 0)
        }
      } else {
        console.debug(
          ' Excluded moorage',
          moorageFeature.properties,
          'moorageStart',
          moorageStart,
          'moorageEnd',
          moorageEnd,
          'logStart',
          logStart,
          'logEnd',
          logEnd,
          referencedMoorageIds.has(moorageId),
        )
      }
    })
    console.debug('mooragesList', mooragesList.value.length)
    // Stats summary
    stats.logs.duration = parseFloat(stats.logs.duration).toFixed(1) + ' h'
    stats.logs.distance = distanceFormatMiles(stats.logs.distance)
    stats.moorages.duration = parseFloat(stats.moorages.duration).toFixed(1) + ' h'
    //console.debug('Stats', stats)

    // Logs bounds
    const updatedBounds = L.latLngBounds([])

    // Loop through each layer and extend the bounds with its coordinates
    mooragesLayers.value.forEach((layer) => {
      if (map.value.hasLayer(layer)) {
        layer.eachLayer((featureLayer) => {
          if (featureLayer.getLatLng) {
            updatedBounds.extend(featureLayer.getLatLng())
          }
        })
      }
    })

    // Fit the map to the calculated bounds
    if (updatedBounds.isValid() && map.value) {
      map.value.fitBounds(updatedBounds)
      // Save the bounds to the mapBounds ref
      mapBounds.value = updatedBounds
      window.dispatchEvent(new Event('resize'))
    }
  } // End updateMap

  const addResetViewControl = () => {
    if (!map.value) return

    const resetControl = L.control({ position: 'topright' })

    resetControl.onAdd = function (mapInstance) {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const link = L.DomUtil.create('a', '', div)
      link.innerHTML = '<i class="va-icon material-icons">refresh</i>'
      link.href = '#'
      div.title = 'Reset View'

      L.DomEvent.on(div, 'click', function (e) {
        L.DomEvent.stopPropagation(e)
        L.DomEvent.preventDefault(e)
        updateMap()
      })

      return div
    }

    resetControl.addTo(map.value)
  }

  const addResetFilterControl = () => {
    if (!map.value) return

    const resetFilter = L.control({ position: 'topright' })
    resetFilter.onAdd = function (mapInstance) {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const link = L.DomUtil.create('a', '', div)
      link.innerHTML = '<i class="va-icon material-icons">filter_alt_off</i>'
      link.href = '#'
      div.title = 'Reset Filter'

      L.DomEvent.on(div, 'click', function (e) {
        L.DomEvent.stopPropagation(e)
        L.DomEvent.preventDefault(e)
        filter.tags = [] // Reset tags
        filter.dateRange = [0, logsListFull.value.length - 1] // Reset range to the new limits
      })

      return div
    }

    resetFilter.addTo(map.value)
  }

  const addLogControl = () => {
    if (!map.value) return

    const logControl = L.control({ position: 'topright' })

    logControl.onAdd = function (mapInstance) {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
      const link = L.DomUtil.create('a', '', div)
      link.innerHTML = '<i class="va-icon material-icons">menu_book</i>'
      link.href = '#'
      div.title = 'logbook printable'

      L.DomEvent.on(div, 'click', function (e) {
        L.DomEvent.stopPropagation(e)
        L.DomEvent.preventDefault(e)
        router.push('/stayslapse')
      })

      return div
    }

    logControl.addTo(map.value)
  }

  const onEachLogFeaturePopup = (feature, layer) => {
    //console.debug(feature)
    // is logbook
    let starttime = dateFormatUTC(feature.properties.starttimestamp)
    let endtime = dateFormatUTC(feature.properties.endtimestamp)
    let duration = durationFormatHours(feature.properties.duration)
    let distance = distanceFormatMiles(feature.properties.distance)
    let avg_speed = speedFormatKnots(feature.properties.avg_sog)
    let max_speed = speedFormatKnots(feature.properties.max_sog)
    let avg_depth = depthFormatI18n(feature.properties.avg_depth)
    let max_depth = depthFormatI18n(feature.properties.max_depth)
    let avg_tws = speedFormatKnots(feature.properties.avg_tws)
    let max_tws = speedFormatKnots(feature.properties.max_tws)
    let notes = feature.properties?.notes || ''
    let text = `<div class='mpopup'>
                            <h4><a href="/log/${feature.properties.id}">${feature.properties.name}</a></h4><br/>
                            <table class='data'><tbody>
                            <tr><th>Start Time</th><td>${starttime}</td></tr>
                            <tr><th>End Time</th><td>${endtime}</td></tr>
                            <tr><th>Distance</th><td>${distance}</td></tr>
                            <tr><th>Duration</th><td>${duration} hours</td></tr>
                            <tr><th>Speed</th><td>avg ${avg_speed} / max ${max_speed}</td></tr>
                            <tr><th>Wind</th><td>avg ${avg_tws} / max ${max_tws}</td></tr>
                            <tr><th>Depth</th><td>avg ${avg_depth} / max ${max_depth}</td></tr>
                            <tr><th>Notes</th><td>${notes}</td></tr>
                            </tbody></table></br>
                            <a href="/timelapse/${feature.properties.id}">Replay</a>
                          </div>`
    //layer.bindPopup(text)
    layer.bindPopup(text, {
      autoPan: true,
      autoPanPadding: L.point(30, 30),
    })
    layer.bindTooltip(text)
  }

  const onEachMoorageFeaturePopup = function (feature, layer) {
    //console.debug(feature)
    var popupContent = '<p>I started out as a GeoJSON ' + feature.geometry.type + ", but now I'm a Leaflet vector!</p>"
    if (feature.properties && feature.properties.id) {
      let duration = durationFormatHours(feature.properties.stays_sum_duration)
      let popup = `<div class='mpopup'><center><h4><a href="/moorage/${feature.properties.id}">${feature.properties.name}</a></h4></center>`
      popup += '<table class="data">'
      popup += '</a></td></tr>'
      popup += '<tr><th>Visits</th><td><a href="/moorage/arrivals-departures/' + feature.properties.id + '">'
      popup += `${feature?.properties?.stays_count}`
      popup += '</a></td></tr>'
      popup += '<tr><th>Duration</th><td>'
      popup += '<a href="/stays/moorage/' + feature.properties.id + '">' + (duration || 0) + ' hour'
      if ((duration || 0) > 1) popup = popup + 's'
      popup = popup + '</a></td></tr>'
      popup +=
        '<tr><th>Preference</th><td>' + stayed_at_options[feature.properties.default_stay_id - 1].text + '</td></tr>'
      if (feature?.properties?.notes) {
        popup += '<tr><th>Notes</th><td>' + feature?.properties?.notes + '</td></tr>'
      }
      popup += '</table></div>'
      popupContent = popup
    }
    layer.bindPopup(popupContent, {
      autoPan: true,
      autoPanPadding: L.point(30, 30),
    })
    //layer.bindTooltip(popupContent)
    /*
      layer.on('mouseover', function () {
        layer.bounce({ duration: 500, height: 80 })
        layer.openPopup()
      })
      layer.on('mouseout', function () {
        layer.stopBouncing()
        layer.closePopup()
      })
      */
  }

  const markerIcon = function (feature, latlng, options = {}) {
    let multiplier = Math.max(map.value.getZoom(), 1)
    multiplier = Math.min(map.value.getZoom(), 9)
    //console.debug('multiplier', multiplier)
    let myMarker = null
    if (feature.properties.default_stay_id == 3) {
      myMarker = L.marker(latlng, {
        icon: new L.Icon({
          iconSize: [multiplier * 4, multiplier * 4],
          iconAnchor: [multiplier * 2, multiplier * 2],
          iconUrl: '/mooring_icon.png',
          popupAnchor: [0, 0],
        }),
      })
    }
    if (feature.properties.default_stay_id == 4) {
      myMarker = L.marker(latlng, {
        icon: new L.Icon({
          iconSize: [multiplier * 4, multiplier * 4],
          iconAnchor: [multiplier * 2, multiplier * 2],
          iconUrl: '/dock_icon.png',
          popupAnchor: [0, 0],
        }),
      })
    } else {
      myMarker = L.marker(latlng, {
        icon: new L.Icon({
          iconSize: [multiplier * 4, multiplier * 4],
          iconAnchor: [multiplier * 2, multiplier * 2],
          iconUrl: '/anchoricon.png',
          popupAnchor: [0, 0],
        }),
      })
    }
    //console.debug(myMarker)
    mooragesMakers.value.push(myMarker)
    return myMarker
  }

  function random_rgb_dark() {
    var o = Math.floor,
      r = Math.random,
      s = 256
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')'
  }

  // Watch for changes in dateArray and update selectedRange accordingly
  watch(logsSlider, (newValue) => {
    filter.dateRange = [0, newValue.length - 1] // Reset range to the new limits
  })

  watch(
    logsListFull,
    (newList) => {
      if (!map.value) return // Ensure map is initialized
      if (!logsLayers.value) return // Ensure logsLayers is initialized
      if (!newList || newList.length === 0) {
        console.warn('No logs available to display.')
        return
      }
      if (newList.length === logsLayers.value.length) return
      logsList.value = newList
      // Remove all existing logs layers from the map
      logsLayers.value.forEach((layer) => map.value.removeLayer(layer))

      logsLayers.value = newList.map((feature) => {
        return L.geoJSON(feature, {
          style: () => ({
            color: random_rgb_dark(),
            weight: 3,
          }),
          onEachFeature: onEachLogFeaturePopup,
        })
      })
    },
    { immediate: true, deep: true },
  )

  watch(
    mooragesListFull,
    (newList) => {
      if (!map.value) return // Ensure map is initialized
      if (!mooragesLayers.value) return // Ensure mooragesLayers is initialized
      if (!newList || newList.length === 0) {
        console.warn('No moorages available to display.')
        return
      }
      if (newList.length === mooragesLayers.value.length) return
      mooragesList.value = newList
      // Remove all existing moorages layers from the map
      mooragesLayers.value.forEach((layer) => map.value.removeLayer(layer))

      mooragesLayers.value = newList.map((feature) => {
        return L.geoJSON(feature, {
          pointToLayer: markerIcon,
          onEachFeature: onEachMoorageFeaturePopup,
        })
      })
    },
    { immediate: true, deep: true },
  )

  // Compute the formatted date range to display the selected dates
  const formattedDateRange = computed(() => {
    const startDate = logsSlider.value[filter.dateRange[0]] // Get start date
    const endDate = logsSlider.value[filter.dateRange[1]] // Get end date
    return `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`
  })

  // Function to format a date for display in a user-friendly format
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Function to format the label shown on the slider for each marker
  const formatDateLabel = (index) => {
    const date = new Date(logsSlider.value[index])
    return formatDate(date)
  }
  // Function to display tooltip text with the selected date range
  const tooltipLabel = computed(() => {
    const startDate = logsSlider.value[filter.dateRange[0]]
    const endDate = logsSlider.value[filter.dateRange[1]]
    return `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`
  })

  const onLogClickNavigate = (coordinates, index) => {
    if (isNaN(index)) return
    //console.debug('onLogClickNavigate', index)
    logsLayers.value.forEach((geoJSONLayer, i) => {
      //console.debug(geoJSONLayer, i, index)
      if (i === index) {
        map.value.addLayer(geoJSONLayer)
        //map.value.flyTo(coordinates)
        setTimeout(() => {
          map.value.fitBounds(geoJSONLayer.getBounds(), { animate: true, duration: 0.5 })
          geoJSONLayer.eachLayer(function (featureLayer) {
            if (featureLayer.openPopup) {
              // Open the popup
              featureLayer.openPopup()
              // Close the side panel
              sidepanelToggleButton()
            }
          })
        }, 600)
      } else {
        map.value.removeLayer(geoJSONLayer)
      }
    })
  }
  const onMoorageClickNavigate = (coordinates, index) => {
    if (isNaN(index)) return
    //console.debug('onMoorageClickNavigate', coordinates, index)
    const latlng = L.latLng(coordinates[1], coordinates[0])
    //map.value.flyTo(latlng)
    // Find and open popup on the matching layer
    const layer = mooragesLayers.value[index]
    if (layer && layer.getLayers) {
      const markerLayer = layer.getLayers()[0] // assuming one marker per feature
      if (markerLayer && markerLayer.openPopup) {
        setTimeout(() => {
          // Fit map on all moorages layer
          map.value.fitBounds(mapBounds.value, { animate: true, duration: 0.5 })
          // Open the popup
          markerLayer.openPopup()
          // Close the side panel
          sidepanelToggleButton()
        }, 600) // wait until flyTo animation completes
      }
    }
  }

  const onMoorageMouseEnter = (id) => {
    if (isNaN(id)) return
    const marker = mooragesMakers.value[id]
    if (marker && marker?._icon && !marker._icon.classList.contains('bouncing')) {
      marker._icon.classList.add('bouncing')
      marker._bouncingMotion.isBouncing = true

      // Gently pan to marker instead of fitting bounds
      map.value.panTo(marker.getLatLng(), { animate: true, duration: 0.5 })
    }
  }
  const stopBouncingMarker = (id) => {
    if (isNaN(id)) return
    const marker = mooragesMakers.value[id]
    //console.debug('stopBouncingMarker', marker)
    if (marker && marker?._icon && marker._icon.classList.contains('bouncing')) {
      marker._icon.classList.remove('bouncing')
    }
  }
  const onLogMouseEnter = (index) => {
    if (isNaN(index)) return
    logsLayers.value.forEach((layer, i) => {
      if (i === index) {
        map.value.addLayer(layer)

        const center = layer.getBounds().getCenter()

        // Instead of fitting the full bounds (jumps the zoom), just softly pan
        map.value.panTo(center, { animate: true, duration: 0.5 })

        // Optionally: If center is outside view, you can use panInsideBounds
        const bounds = layer.getBounds()
        map.value.panInsideBounds(bounds, { animate: true, duration: 0.5, padding: [50, 50] })

        // (Optional) Open the tooltip instead of popup to stay lightweight
        layer.openTooltip()
      } else {
        map.value.removeLayer(layer)
      }
    })
  }
  const onMouseLeaveLog = (index) => {
    // Remove all log layers
    logsLayers.value.forEach((layer) => map.value.removeLayer(layer))

    // Add back only selected ones
    const [startIdx, endIdx] = filter.dateRange
    for (let i = startIdx; i <= endIdx; i++) {
      if (logsLayers.value[i]) {
        map.value.addLayer(logsLayers.value[i])
      }
    }
  }

  const sidepanelToggleButton = () => {
    const toggleButton = document.querySelector('.sidepanel-toggle-button')
    //console.debug('sidepanelToggleButton', toggleButton)
    if (toggleButton) {
      toggleButton.click()
    }
  }
  const onLogsResetClick = (event) => {
    event.preventDefault() // if you're preventing default anchor behavior
    console.debug('Logs tab clicked')
    // Show all logs
    filter.dateRange = [0, logsListFull.value.length - 1]
  }
  const onLogsTabClick = (event) => {
    event.preventDefault() // if you're preventing default anchor behavior
    console.debug('Logs tab clicked')
    // Show all logs
    //filter.dateRange = [0, logsListFull.value.length - 1]
  }
  const onMooragesTabClick = (event) => {
    event.preventDefault() // if you're preventing default anchor behavior
    console.debug('Moorages tab clicked')
    // Show all Moorages
    //filter.dateRange = [0, logsListFull.value.length - 1]
  }
  const onStaysTabClick = async (event) => {
    event.preventDefault() // if you're preventing default anchor behavior
    console.debug('Stays tab clicked')
    await fetchStays()
  }
  const fetchStays = async () => {
    // fetch the Stays tab content
    console.debug('Stays tab content updated')
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.notes_history()
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('History list', rowsData.value)
        apiSuccess.value = true
      } else {
        console.warn('History', response)
        //throw { response }
      }
    } catch ({ response }) {
      console.error(response)
    } finally {
      isBusy.value = false
    }
  }

  // Watch for changes in dateArray and update selectedRange accordingly
  watch(filter, (newValue) => {
    console.debug('newValue filter', newValue)
    updateMap()
  })

  // Tags chips
  function deleteChip(chip) {
    filter.tags = filter.tags.filter((v) => v !== chip)
  }

  const noteshistory = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => ({
          stay_id: row.stay_id,
          moorage_id: row.moorage_id,
          stay_name: row.stay_name || 'Active stay',
          moorage_name: row.moorage_name || 'Active moorage',
          arrived: dateFormatUTC(row.arrived),
          stay_code: row.stay_code,
          dms: decimalToDMS(row.latitude, row.longitude),
          coordinates: [row.longitude, row.latitude],
          stay_notes: row.stay_notes,
          moorage_notes: row.moorage_notes,
          images: row.has_images ? row.images || [] : [],
          iconUrl:
            row.stay_code === 3 ? '/mooring_icon.png' : row.stay_code === 4 ? '/dock_icon.png' : '/anchoricon.png',
        }))
      : []
  })

  const handleNoteUpdated = async (updatedNote) => {
    showEditModal.value = false
    console.log('handleNoteUpdated', typeData.value, updatedNote)
    if (typeData.value === 'logbook') {
      console.debug('updating logbook note', logsList.value)
      logsList.value = logsList.value.map((row) =>
        row.properties.id === updatedNote.id
          ? { properties: { ...row.properties, name: updatedNote.name, notes: updatedNote.notes } }
          : row,
      )
      CacheStore.logs_map = CacheStore.logs_map.map((row) =>
        row.geojson?.properties?.id === updatedNote.id
          ? {
              ...row,
              geojson: {
                ...row.geojson,
                properties: {
                  ...row.geojson.properties,
                  name: updatedNote.name,
                  notes: updatedNote.notes,
                },
              },
            }
          : row,
      )
    }
    if (typeData.value === 'moorage') {
      console.debug('updating moorage note', mooragesList.value)
      mooragesList.value = mooragesList.value.map((row) =>
        row.properties.id === updatedNote.id
          ? { properties: { ...row.properties, name: updatedNote.name, notes: updatedNote.notes } }
          : row,
      )
      CacheStore.moorages_map = CacheStore.moorages_map.map((row) =>
        row.geojson?.properties?.id === updatedNote.id
          ? {
              ...row,
              geojson: {
                ...row.geojson,
                properties: {
                  ...row.geojson.properties,
                  name: updatedNote.name,
                  notes: updatedNote.notes,
                },
              },
            }
          : row,
      )
    }
    if (typeData.value === 'stay') {
      rowsData.value = rowsData.value.map((row) =>
        row.stay_id === updatedNote.stay_id
          ? { ...row, stay_notes: updatedNote.stay_notes, stay_name: updatedNote.name }
          : row,
      )
    }
    // Clean CacheStore and force refresh
    //await CacheStore.resetCache()
    //await getMap()
  }
  const handlePhotoUpdated = async (updatedPhoto) => {
    showPhotoModal.value = false
    console.log('handlePhotoUpdated', typeData.value, updatedPhoto)
    if (typeData.value === 'logbook') {
      //console.debug('updating log photo', logsList.value)
      logsList.value = logsList.value.map((row) =>
        row.properties.id === updatedPhoto.id
          ? { properties: { ...row.properties, has_images: updatedPhoto.has_images, images: updatedPhoto.images } }
          : row,
      )
      CacheStore.logs_map = CacheStore.logs_map.map((row) =>
        row.geojson?.properties?.id === updatedPhoto.id
          ? {
              ...row,
              geojson: {
                ...row.geojson,
                properties: {
                  ...row.geojson.properties,
                  has_images: updatedPhoto.has_images,
                  images: updatedPhoto.images,
                },
              },
            }
          : row,
      )
    }
    if (typeData.value === 'moorage') {
      //console.debug('updating moorage photo', mooragesList.value)
      mooragesList.value = mooragesList.value.map((row) =>
        row.properties.id === updatedPhoto.id
          ? { properties: { ...row.properties, has_images: updatedPhoto.has_images, images: updatedPhoto.images } }
          : row,
      )
      CacheStore.moorages_map = CacheStore.moorages_map.map((row) =>
        row.geojson?.properties?.id === updatedPhoto.id
          ? {
              ...row,
              geojson: {
                ...row.geojson,
                properties: {
                  ...row.geojson.properties,
                  has_images: updatedPhoto.has_images,
                  images: updatedPhoto.images,
                },
              },
            }
          : row,
      )
    }
    if (typeData.value === 'stay') {
      //console.debug('updating stays photo', rowsData.value)
      rowsData.value = rowsData.value.map((row) =>
        row.stay_id === updatedPhoto.stay_id
          ? { ...row, has_images: updatedPhoto.has_images, images: updatedPhoto.images }
          : row,
      )
      CacheStore.stays = CacheStore.stays.map((row) =>
        row.stay_id === updatedPhoto.stay_id
          ? { ...row, has_images: updatedPhoto.has_images, images: updatedPhoto.images }
          : row,
      )
    }
    // Clean CacheStore and force refresh
    //await CacheStore.resetCache()
    //await getMap()
  }
  const navigateMoorage = (coordinates) => {
    function openPopupClick() {
      //markersMap.value[index].openPopup()
      //openPopupMarker(coordinates)
      //map.value.off('moveend', openPopupClick)
    }
    console.log(`navigate to Moorage: ${coordinates}`)
    map.value.flyTo([...coordinates].reverse(), 15, {
      animate: true,
      duration: 0.5,
      easeLinearity: 0.5,
    })
    map.value.on('moveend', openPopupClick)
  }
  const selectedData = ref(null)
  const typeData = ref(null)
  const showEditModal = ref(false)
  const showPhotoModal = ref(false)

  function openEditModal(item, type) {
    selectedData.value = item
    typeData.value = type
    showEditModal.value = true
  }

  function openPhotoModal(item, type) {
    selectedData.value = item
    typeData.value = type
    showPhotoModal.value = true
  }
  async function handleDelete(item, type, image) {
    console.debug('Removing image', item, type, image)
    const isDelete = true
    apiError.value = null

    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    const payload = {
      _image_id: image.id,
      _id: item.id ? item.id : item.stay_id,
      _type: type,
      _operation: 'delete',
      _vessel_id: vesselId,
    }
    try {
      const response = await api.image_update(payload)
      //console.log(response)
      if (response) {
        console.log('Image update success', response)
        // Filter out the deleted image
        const updatedImages = item.images.filter((img) => img.id !== image.id)
        apiError.value = null
        if (type === 'logbook') {
          //console.debug('removing log photo', logsList.value)
          logsList.value = logsList.value.map((row) =>
            row.properties.id === item.id
              ? {
                  properties: {
                    ...row.properties,
                    has_images: updatedImages.length > 0,
                    images: updatedImages,
                  },
                }
              : row,
          )
          // Cleanup localstorage cache
          //console.debug('Before CacheStore.logs_map', CacheStore.logs_map)
          CacheStore.logs_map = CacheStore.logs_map.map((row) =>
            row.geojson?.properties?.id === item.id
              ? {
                  ...row,
                  geojson: {
                    ...row.geojson,
                    properties: {
                      ...row.geojson.properties,
                      has_images: updatedImages.length > 0,
                      images: updatedImages,
                    },
                  },
                }
              : row,
          )
        }
        if (type === 'moorage') {
          //console.debug('removing moorage photo', mooragesList.value)
          mooragesList.value = mooragesList.value.map((row) =>
            row.properties.id === item.id
              ? {
                  properties: {
                    ...row.properties,
                    has_images: updatedImages.length > 0,
                    images: updatedImages,
                  },
                }
              : row,
          )
          // Cleanup localstorage cache
          CacheStore.moorages_map = CacheStore.moorages_map.map((row) =>
            row.geojson?.properties?.id === item.id
              ? {
                  ...row,
                  geojson: {
                    ...row.geojson,
                    properties: {
                      ...row.geojson.properties,
                      has_images: updatedImages.length > 0,
                      images: updatedImages,
                    },
                  },
                }
              : row,
          )
        }
        if (type === 'stay') {
          //console.debug('removing stay photo', rowsData.value)
          rowsData.value = rowsData.value.map((row) =>
            row.stay_id === item.stay_id
              ? { ...row, has_images: updatedImages.length > 0, images: updatedImages }
              : row,
          )
          // Cleanup localstorage stays
          CacheStore.stays = CacheStore.stays.map((row) =>
            row.stay_id === item.stay_id
              ? { ...row, has_images: updatedImages.length > 0, images: updatedImages }
              : row,
          )
        }

        if (import.meta.env.VITE_S3_URL) {
          // Now delete the image from S3 using presigned URL
          try {
            // Step 1: Get presigned DELETE URL from backend
            const deleteUrl = await api.getPresignedDeleteUrl({
              _image_type: image.type,
              _id: item.id ? item.id : item.stay_id,
              _type: type,
              _vessel_id: vesselId,
              _idx: image.id, // Index of images array for stays, moorages, logbooks
            })
            // Step 2: Upload the file directly
            const deleteResult = await fetch(deleteUrl, {
              method: 'DELETE',
            })

            if (!deleteResult.ok) {
              throw new Error(`Upload failed: ${deleteResult.statusText}`)
            }
            // Filter out the deleted image
            const updatedImages = item.images.filter((img) => img.id !== image.id)
            initToast({
              message: t('photoUploader.success_delete'),
              position: 'top-right',
              color: 'success',
            })
          } catch (err) {
            console.error('Image deleting error:', err)
            apiError.value = 'Failed to deleting image.'
            initToast({
              message: t('photoUploader.error_delete'),
              position: 'top-right',
              color: 'warning',
            })
          }
        } else {
          throw { response }
        }
      }
    } catch (err) {
      console.error('Image update error:', err)
      apiError.value = 'Failed to update image.'
    } finally {
      isBusy.value = false
    }
  }
  onBeforeUnmount(async () => {
    if (map.value) {
      map.value.remove()
      apiError.value = null
    }
  })
  const viewerOpen = ref(false)
  const currentImageIndex = ref(0)
  const swipeOffset = ref(0)
  const touchStartX = ref(0)
  const touchCurrentX = ref(0)

  const openImage = (index) => {
    currentImageIndex.value = index
    viewerOpen.value = true
    document.body.style.overflow = 'hidden' // Prevent background scrolling
  }

  const closeImage = () => {
    viewerOpen.value = false
    swipeOffset.value = 0
    document.body.style.overflow = ''
  }

  const nextImage = (item) => {
    if (currentImageIndex.value < item.images.length - 1) {
      currentImageIndex.value++
    }
  }

  const previousImage = (item) => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--
    }
  }

  // Touch gesture handlers
  const handleTouchStart = (e) => {
    touchStartX.value = e.touches[0].clientX
  }

  const handleTouchMove = (e) => {
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
  const handleDeleteCurrent = async (item) => {
    const currentImage = item.images[currentImageIndex.value]
    //console.log('handleDeleteCurrent', currentImage)

    // Call your delete handler
    await handleDelete(item, currentImage)
    // Adjust current index if needed
    if (currentImageIndex.value >= item.images.length) {
      currentImageIndex.value = Math.max(0, item.images.length - 1)
    }

    // Close viewer if no images left
    if (item.images.length === 0) {
      closeImage()
    }
  }
  async function confirmDeleteCurrent(item, type, image) {
    if (!confirm(t('photoUploader.confirm_delete'))) return
    const currentImage = item.images[currentImageIndex.value]
    await handleDelete(item, type, currentImage)
  }
</script>

<style lang="scss">
  $map-height: calc(91vh - 3.5rem);
  $map-height-mobile: calc(80vh - 3rem);

  .leaflet-map {
    z-index: 0;
    width: 100%;
    height: $map-height;
    @media (max-width: 768px) {
      height: $map-height-mobile;
    }
  }
  .sidepanel {
    z-index: 10;
    width: 320px;
    height: $map-height;
    @media (max-width: 768px) {
      height: $map-height-mobile;
    }
    .sidepanel-content {
      width: 320px;
      height: $map-height;
      @media (max-width: 768px) {
        height: $map-height-mobile;
      }
    }
  }
  .sidebar-tab-link.active,
  .sidebar-tab-link:hover {
    color: var(--va-primary) !important;
    border-bottom-color: var(--va-primary) !important;
  }
  .date-slider {
    color: var(--va-primary) !important;
    padding: 0.5rem 2rem 0.5rem 2rem;
  }
  .mpopup {
    width: 210px;
    th {
      text-align: right;
      padding-right: 5px;
      font-weight: bold;
    }
    td {
      font-weight: normal;
    }
    a {
      cursor: pointer;
    }
    h4 {
      font-weight: bold;
    }
  }
  .line-item {
    display: flex;
    //align-items: center;
    gap: 4px; /* Adds spacing between elements */
  }
  .line-item:hover {
    background-color: yellow;
  }
  .bouncing {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #ff5722;
  }

  @keyframes bounce {
    from {
      transform: translate3d(0, 0, 0);
    }

    to {
      transform: translate3d(0, 200px, 0);
    }
  }

  .map-controls {
    position: absolute;
    //bottom: 10px;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 1000; /* Make sure it's above Leaflet map */
  }

  .date-slider {
    flex: 1;
  }

  .tag-selector {
    margin-left: 20px;
    width: 300px;
  }

  .va-input-wrapper__field.va-input-wrapper__text.va-input__content__input {
    z-index: 9999 !important;
  }
  .va-dropdown__content.va-select-dropdown__content.va-dropdown__content-wrapper {
    z-index: 9999 !important;
  }
  .vessel-image {
    display: block;
    margin: 0 auto 10px auto; /* Centers the image and adds space below */
    width: 180px; /* Fixed width */
    height: auto; /* Maintain aspect ratio */
    object-fit: contain; /* Ensures it fits within bounds without distortion */
    border-radius: 4px; /* Optional: rounds corners slightly */
  }
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
