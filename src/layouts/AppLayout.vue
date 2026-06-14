<template>
  <!--<template v-if="isLoading">
    <div class="row justify-center">
      <LoadingScreen />
    </div>
  </template>-->
  <template v-if="!isLoading">
    <div class="app-layout">
      <navbar />
      <div class="app-layout__content">
        <div class="app-layout__sidebar-wrapper" :class="{ minimized: isSidebarMinimized }">
          <div v-if="isFullScreenSidebar" class="flex justify-end">
            <va-button
              class="px-4 py-4"
              icon="md_close"
              preset="plain"
              color="dark"
              @click="onCloseSidebarButtonClick"
            />
          </div>
          <sidebar
            :width="sidebarWidth"
            :minimized="isSidebarMinimized"
            :minimized-width="sidebarMinimizedWidth"
            :animated="!isMobile"
          />
        </div>
        <div class="app-layout__page" :style="{ padding: pagePadding }">
          <router-view />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
  import { computed, onBeforeUnmount, onBeforeMount, onMounted, ref, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { onBeforeRouteUpdate, useRouter } from 'vue-router'
  import { useGlobalStore } from '../stores/global-store'
  import { useCacheStore } from '../stores/cache-store'
  import { useVesselStore } from '../stores/vessel-store'

  import Navbar from '../components/navbar/Navbar.vue'
  import Sidebar from '../components/sidebar/Sidebar.vue'
  //import LoadingScreen from '../components/loadingScreen.vue'

  import { useVersionCheck } from '../composables/useVersionCheck'
  useVersionCheck()

  const GlobalStore = useGlobalStore()
  const { hasLogs } = storeToRefs(GlobalStore)
  const { fetchStats } = GlobalStore

  const CacheStore = useCacheStore()
  const { getTags, Activity, lineChartbyMonth, lineChartbyWeek, logsChartHeatmap, logsChartNetwork, getAPI } =
    CacheStore

  const VesselStore = useVesselStore()
  const router = useRouter()

  const mobileBreakPointPX = 640
  const tabletBreakPointPX = 768
  const largeBreakPointPX = 1200

  const sidebarWidth = ref('16rem')
  const sidebarMinimizedWidth = ref(undefined)
  const hasFullMap = ref(false)
  const pagePadding = ref('1.5rem')

  //const isMobile = ref(false)
  const isTablet = ref(false)
  const { isSidebarMinimized, isMobile } = storeToRefs(GlobalStore)
  const { fetchSettings } = GlobalStore
  const { fetchVessel } = VesselStore
  const { vesselName } = storeToRefs(VesselStore)

  const checkIsTablet = () => window.innerWidth <= tabletBreakPointPX
  const checkIsMobile = () => window.innerWidth <= mobileBreakPointPX

  const adjustPadding = async () => {
    await nextTick()
    hasFullMap.value = document.querySelector('.leaflet-map__full') != null
    pagePadding.value = hasFullMap.value || window.innerWidth < largeBreakPointPX ? '0rem' : '1.5rem'
  }

  router.afterEach(() => {
    adjustPadding()
  })

  const onResize = () => {
    isSidebarMinimized.value = checkIsTablet()

    isMobile.value = checkIsMobile()
    isTablet.value = checkIsTablet()
    sidebarMinimizedWidth.value = isMobile.value ? '0' : '0' //'4.5rem'
    sidebarWidth.value = isTablet.value ? '100%' : '16rem'

    adjustPadding()
  }

  const isLoading = ref(true)

  onMounted(async () => {
    isLoading.value = false
    window.addEventListener('resize', onResize)

    adjustPadding()

    // Load cache
    const mylogs = await getAPI('logs')
    await getAPI('stays')
    await getAPI('moorages')
    // Check cache, do we have inconsistent data from cache.
    const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0
    if (isEmpty(CacheStore.logs) && isEmpty(CacheStore.stays) && isEmpty(CacheStore.moorages)) {
      console.warn('Warning, no metrics, new vessel?')
    }
    // Do we have inconsistent data from cache?
    const sources = [CacheStore.logs, CacheStore.stays, CacheStore.moorages]
    // Count how many arrays are non-empty
    const nonEmptyCount = sources.filter((arr) => Array.isArray(arr) && arr.length > 0).length
    // If some have data and others don't, that's inconsistent
    if (nonEmptyCount > 0 && nonEmptyCount < sources.length) {
      console.warn('Warning, inconsistent cache data detected. Resetting cache.')
      await CacheStore.resetCache()
    }
    // Load dynamic data for graph and dashboard
    await getTags()
    await Activity()
    await lineChartbyMonth()
    await lineChartbyWeek()
    await logsChartHeatmap()
    await logsChartNetwork()
    // Fetch Stats
    try {
      await fetchStats()
      //console.log('AppLayout onMounted stats', stats_logs.value)
      //console.log('AppLayout onMounted stats', stats_moorages.value)
    } catch (err) {
      console.log('AppLayout stats failed', err)
      //updateError.value = response.message
    } finally {
      //isBusy.value = false
    }
    console.debug('AppLayout onMounted CacheStore logs', CacheStore.logs.length, mylogs.length, hasLogs.value)

    // Check for cache consistency against stats
    if (hasLogs.value != mylogs.length || hasLogs.value != CacheStore.logs.length) {
      console.warn('Warning, inconsistent cache data detected. Resetting cache.')
      await CacheStore.resetCache()
    }
  })

  onBeforeMount(async () => {
    console.log('AppLayout onBeforeMount')
    if (!GlobalStore.isLoggedIn && GlobalStore.isPublic) {
      console.log('AppLayout onBeforeMount anonymous access isPublic', GlobalStore.isPublic)
      if (!VesselStore.vesselName) {
        await VesselStore.fetchVessel()
      }
      console.log('AppLayout onBeforeMount anonymous access fetchVessel', VesselStore.vesselName)
      return
    }
    await fetchSettings(true)
    if (!GlobalStore.isLoggedIn) {
      console.log('AppLayout router push logout')
      router.push({
        name: 'logout',
      })
    }
    console.log('AppLayout onBeforeMount fetchSettings', GlobalStore.settings)
    if (!VesselStore.vesselName) {
      await fetchVessel()
    }
    console.log('AppLayout onBeforeMount fetchVessel', VesselStore)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  onBeforeRouteUpdate(() => {
    if (checkIsTablet()) {
      // Collapse sidebar after route change for Mobile
      isSidebarMinimized.value = true
      isMobile.value = true
    }
  })

  onResize()

  const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)
  const isFullScreenNavbar = computed(() => isTablet.value && !isSidebarMinimized.value)

  const onCloseSidebarButtonClick = () => {
    isSidebarMinimized.value = true
  }
</script>

<style lang="scss">
  $mobileBreakPointPX: 640px;
  $tabletBreakPointPX: 768px;

  .app-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;

    &__navbar {
      min-height: 4rem;
    }

    &__content {
      display: flex;
      height: calc(100vh - 4.5rem);
      margin-top: 0.5rem;
      flex: 1;

      .app-layout__sidebar-wrapper {
        position: relative;
        height: 100%;
        background: #ffffff;

        @media screen and (max-width: $tabletBreakPointPX) {
          &:not(.minimized) {
            width: 100%;
            height: 100%;
            position: fixed;
            top: 0;
            z-index: 999;
          }

          .va-sidebar:not(.va-sidebar--minimized) {
            .va-sidebar__menu {
              padding: 0;
            }
          }
        }
      }
    }

    &__page {
      flex-grow: 2;
      overflow-y: scroll;

      svg.va-icon.themed {
        fill: var(--va-on-background-primary);

        path {
          fill: var(--va-on-background-primary);
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
    }
  }

  /* va-select below content fix */
  .va-data-table .va-data-table__table.striped .va-data-table__table-tr,
  .va-data-table .va-data-table__table.striped .va-data-table__table-tr:nth-child(2n):not(.selected) {
    z-index: unset;
  }

  .va-data-table:not(.va-data-table--virtual-scroller) {
    overflow: unset;
  }

  /* va inputs on striped tables */
  .va-table--striped tbody > tr:nth-child(even),
  .va-data-table__table.striped tbody > tr:nth-child(even) {
    .va-input {
      --va-input-wrapper-background: var(--va-background-secondary);
    }

    .va-select .va-input-wrapper {
      --va-input-wrapper-background: var(--va-background-secondary);
    }

    .va-switch .va-switch__checker-wrapper {
      background-color: var(--va-background-secondary);
    }
  }

  /* mitigate data table overextension */
  .va-data-table__table-tr > .va-data-table__table-td:first-child > a {
    display: inline-block;
    max-width: 18rem;
    overflow: hidden;
  }
</style>
