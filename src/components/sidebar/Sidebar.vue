<!-- src/components/sidebar/AppSidebar.vue  (replaces Sidebar.vue) -->
<template>
  <va-sidebar :width="width" :minimized="isRail" :minimized-width="minimizedWidth" :animated="animated">
    <menu-rail v-if="isRail" :sections="sections" />
    <menu-accordion v-else :sections="sections" />
  </va-sidebar>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import NavigationRoutes, { filterSections } from './NavigationRoutes'
  import MenuAccordion from './menu/MenuAccordion.vue'
  import MenuRail from './menu/MenuMinimized.vue'

  const props = withDefaults(
    defineProps<{
      width?: string
      color?: string
      animated?: boolean
      minimized?: boolean
      minimizedWidth?: string
    }>(),
    {
      width: '16rem',
      color: 'secondary',
      animated: true,
      minimized: false,
      minimizedWidth: '4.25rem',
    },
  )

  const sections = computed(() =>
    filterSections(NavigationRoutes.sections, {
      grafana: Boolean(import.meta.env.VITE_GRAFANA_URL),
      qgis: Boolean(import.meta.env.VITE_QGIS_URL),
    }),
  )

  /* ------------------------------------------------------------------ *
   * Auto-rail on full-bleed map routes
   *
   * Preferred signal is `meta.fullBleed: true` on the route. The name set
   * below is a fallback so this works before the router is touched.
   * `.leaflet-map__full` DOM sniffing is intentionally not used here — it
   * resolves a frame too late and the sidebar would visibly jump.
   * ------------------------------------------------------------------ */
  const FULL_BLEED_ROUTES = new Set(['map-explorer', 'map', 'log-map', 'timelapse-replay', 'windy', 'logslapse'])

  const route = useRoute()
  const isFullBleed = computed(
    () => route.matched.some((r) => r.meta?.fullBleed === true) || FULL_BLEED_ROUTES.has(String(route.name ?? '')),
  )

  // The user can always override the auto-rail with the navbar toggle; the
  // override lasts until the next navigation.
  const manuallyExpanded = ref(false)
  watch(
    () => props.minimized,
    (minimized) => {
      manuallyExpanded.value = !minimized && isFullBleed.value
    },
  )
  watch(
    () => route.fullPath,
    () => (manuallyExpanded.value = false),
  )

  const isRail = computed(() => props.minimized || (isFullBleed.value && !manuallyExpanded.value))
</script>

<style lang="scss">
  .va-sidebar {
    // Hide sidebar scrollbar (appears when submenus expand beyond viewport height)
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }

    &__menu {
      padding: 0;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }

    &-item {
      &__icon {
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 0 0 auto;
        fill: var(--va-on-background-primary);
      }

      &__icon path {
        fill: var(--va-on-background-primary);
      }
    }
  }
</style>
