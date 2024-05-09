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
        <div class="app-layout__page">
          <router-view />
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
  import { computed, onBeforeUnmount, onBeforeMount, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { onBeforeRouteUpdate, useRouter } from 'vue-router'
  import { useGlobalStore } from '../stores/global-store'
  import { useVesselStore } from '../stores/vessel-store'

  import Navbar from '../components/navbar/Navbar.vue'
  import Sidebar from '../components/sidebar/Sidebar.vue'
  //import LoadingScreen from '../components/loadingScreen.vue'

  const GlobalStore = useGlobalStore()
  const VesselStore = useVesselStore()
  const router = useRouter()

  const mobileBreakPointPX = 640
  const tabletBreakPointPX = 768

  const sidebarWidth = ref('16rem')
  const sidebarMinimizedWidth = ref(undefined)

  //const isMobile = ref(false)
  const isTablet = ref(false)
  const { isSidebarMinimized, isMobile } = storeToRefs(GlobalStore)
  const { fetchSettings } = GlobalStore
  const { fetchVessel } = VesselStore

  const checkIsTablet = () => window.innerWidth <= tabletBreakPointPX
  const checkIsMobile = () => window.innerWidth <= mobileBreakPointPX

  const onResize = () => {
    isSidebarMinimized.value = checkIsTablet()

    isMobile.value = checkIsMobile()
    isTablet.value = checkIsTablet()
    sidebarMinimizedWidth.value = isMobile.value ? '0' : '4.5rem'
    sidebarWidth.value = isTablet.value ? '100%' : '16rem'
  }

  const isLoading = ref(true)

  onMounted(() => {
    isLoading.value = false
    window.addEventListener('resize', onResize)
  })

  onBeforeMount(async () => {
    console.log('AppLayout onBeforeMount')
    if (!GlobalStore.isLoggedIn && GlobalStore.isPublic) {
      console.log('AppLayout anonymous access isPublic', GlobalStore.isPublic)
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
    if (!VesselStore.name) {
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
      height: calc(100vh - 4rem);
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
