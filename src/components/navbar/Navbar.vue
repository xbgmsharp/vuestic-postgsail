<template>
  <div class="app-layout__navbar">
    <va-navbar>
      <template #left>
        <div class="left">
          <va-icon-menu-collapsed
            :class="{ 'x-flip': isSidebarMinimized }"
            class="va-navbar__item"
            :color="colors.primary"
            @click="GlobalStore.toggleSidebar"
          />
          <router-link to="/">
            <postgsail-logo class="logo" height="32" />
          </router-link>
        </div>
      </template>
      <template #center> </template>
      <template #right>
        <div class="app-navbar__actions flex">
          <a href="https://github.com/xbgmsharp/vuestic-postgsail/" target="_blank">
            <va-icon name="github2" class="app-navbar-actions__item" :size="32" />
          </a>
          <a
            href="https://join.slack.com/t/signalk-dev/shared_invite/zt-1leccop43-KrU7G6yBq9g91KXjZtNg1g"
            target="_blank"
          >
            <va-icon name="slack" class="app-navbar-actions__item" :size="32" />
          </a>
        </div>
        <app-navbar-actions class="app-navbar__actions" :user-name="userName" />
      </template>
    </va-navbar>
  </div>
</template>

<script setup>
  import { computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { useColors } from 'vuestic-ui'
  import PostgsailLogo from '../PostgsailLogo.vue'
  import VaIconMenuCollapsed from '../icons/VaIconMenuCollapsed.vue'
  import AppNavbarActions from './components/AppNavbarActions.vue'

  const GlobalStore = useGlobalStore()

  const { toggleSidebar } = GlobalStore
  const { isSidebarMinimized, userName } = storeToRefs(GlobalStore)
  watch(isSidebarMinimized, () => {
    console.log('isSidebarMinimized ref changed!')
    console.log('isSidebarMinimized:', isSidebarMinimized.value)
    //GlobalStore.$state.isSidebarMinimized = isSidebarMinimized.value
  })

  const { getColors } = useColors()
  const colors = computed(() => getColors())
</script>

<style lang="scss" scoped>
  .va-navbar {
    box-shadow: var(--va-box-shadow);
    z-index: 2;

    &__center {
      @media screen and (max-width: 1200px) {
        .app-navbar__github-button {
          display: none;
        }
      }
      @media screen and (max-width: 950px) {
        .app-navbar__text {
          display: none;
        }
      }
    }

    @media screen and (max-width: 950px) {
      .left {
        width: 100%;
      }
      .app-navbar__actions {
        //width: 100%;
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .left {
    display: flex;
    align-items: center;
    & > * {
      margin-right: 1.5rem;
    }
    & > *:last-child {
      margin-right: 0;
    }
  }

  .x-flip {
    transform: scaleX(-100%);
  }

  .app-navbar__text > * {
    margin-right: 0.5rem;
    &:last-child {
      margin-right: 0;
    }
  }
</style>
