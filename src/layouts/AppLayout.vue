<template>
  <template v-if="isLoading">
    <div class="row justify-center">
      <LoadingScreen />
    </div>
  </template>
  <template v-if="!isLoading">
    <div class="app-layout">
      <navbar />
      <div class="app-layout__content">
        <div class="app-layout__sidebar-wrapper" :class="{ minimized: isSidebarMinimized }">
          <div v-if="isFullScreenSidebar" class="d-flex justify-end">
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
          <div class="layout fluid va-gutter-5">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
  import { computed, onBeforeUnmount, onBeforeMount, onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { onBeforeRouteUpdate } from 'vue-router'

  import { useGlobalStore } from '../stores/global-store'

  import Navbar from '../components/navbar/Navbar.vue'
  import Sidebar from '../components/sidebar/Sidebar.vue'
  import LoadingScreen from '../components/loadingScreen.vue'

  import PostgSail from '../services/postgsail.js'

  const GlobalStore = useGlobalStore()

  const mobileBreakPointPX = 640
  const tabletBreakPointPX = 768

  const sidebarWidth = ref('16rem')
  const sidebarMinimizedWidth = ref(undefined)

  const isMobile = ref(false)
  const isTablet = ref(false)
  const { isSidebarMinimized } = storeToRefs(GlobalStore)
  const { fetchSettings } = GlobalStore

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
  const isBusy = ref(false)
  const apiError = ref(null)

  onMounted(() => {
    isLoading.value = false
    window.addEventListener('resize', onResize)
    //fetchSettings()
    //console.log(GlobalStore.userName)
    //GlobalStore.userName = userName.value
    //changeUserName(userName.value)
    /*
    if (localStorage.getItem('settings') === null) {
      handleSettings()
    }
    */
  })

  onBeforeMount(async () => {
    console.log('onBeforeMount AppLayout')
    if (!Object.keys(GlobalStore.settings).length) {
      await fetchSettings()
    }
    console.log(GlobalStore.settings)
  })

  const handleSettings = async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.settings()
      if (response.data && response.data.settings) {
        console.log(response.data.settings)
        //localStorage.setItem('settings', JSON.stringify(response.data.settings))
        GlobalStore.userName = response.data.settings.username
        GlobalStore.settings = response.data.settings
        //changeUserName(response.data.settings.username)
      } else {
        throw {
          response: { data: { message: 'Wrong API response. Expected array, got ' + typeof response.data + '.' } },
        }
      }
    } catch ({ response }) {
      apiError.value = response
      console.warn('Unable to get settings...', apiError.value)
    } finally {
      isBusy.value = false
    }
  }

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })

  onBeforeRouteUpdate(() => {
    if (checkIsTablet()) {
      // Collapse sidebar after route change for Mobile
      isSidebarMinimized.value = true
    }
  })

  onResize()

  const isFullScreenSidebar = computed(() => isTablet.value && !isSidebarMinimized.value)

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

      @media screen and (max-width: $tabletBreakPointPX) {
        height: calc(100vh - 6.5rem);
      }

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
    }
  }
</style>
