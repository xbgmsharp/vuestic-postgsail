<!-- src/components/sidebar/menu/MenuAccordion.vue -->
<template>
  <nav class="app-menu" :aria-label="t('menu.aria.primary')">
    <div v-for="section in sections" :key="section.id" class="app-menu__section">
      <div :id="`app-menu-${section.id}`" class="app-menu__section-label">
        {{ t(section.displayName) }}
      </div>

      <ul class="app-menu__list" :aria-labelledby="`app-menu-${section.id}`">
        <li v-for="item in section.items" :key="item.name">
          <!-- Branch: Places, Monitoring -->
          <va-collapse v-if="item.children?.length" v-model="expanded[item.name]" class="app-menu__group">
            <template #header>
              <va-sidebar-item class="app-menu__item" :active="isBranchActive(item, routeName) && !expanded[item.name]">
                <va-sidebar-item-content>
                  <va-icon :name="item.meta.icon" class="va-sidebar-item__icon" />
                  <va-sidebar-item-title>{{ t(item.displayName) }}</va-sidebar-item-title>
                  <va-icon
                    class="app-menu__chevron"
                    size="small"
                    :name="expanded[item.name] ? 'expand_less' : 'expand_more'"
                  />
                </va-sidebar-item-content>
              </va-sidebar-item>
            </template>

            <ul class="app-menu__sublist">
              <li v-for="child in item.children" :key="child.name">
                <va-sidebar-item
                  :id="child.name"
                  class="app-menu__item app-menu__item--child"
                  :active="isItemActive(child, routeName)"
                  :aria-current="isItemActive(child, routeName) ? 'page' : undefined"
                  :to="{ name: child.name }"
                >
                  <va-sidebar-item-content>
                    <va-icon :name="child.meta.icon" class="va-sidebar-item__icon" />
                    <va-sidebar-item-title>{{ t(child.displayName) }}</va-sidebar-item-title>
                  </va-sidebar-item-content>
                </va-sidebar-item>
              </li>
            </ul>
          </va-collapse>

          <!-- Leaf -->
          <va-sidebar-item
            v-else
            :id="item.name"
            class="app-menu__item"
            :active="isItemActive(item, routeName)"
            :aria-current="isItemActive(item, routeName) ? 'page' : undefined"
            :to="{ name: item.name }"
          >
            <va-sidebar-item-content>
              <va-icon :name="item.meta.icon" class="va-sidebar-item__icon" />
              <va-sidebar-item-title>{{ t(item.displayName) }}</va-sidebar-item-title>
            </va-sidebar-item-content>
          </va-sidebar-item>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
  import { computed, reactive, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { INavigationSection, isItemActive, isBranchActive } from '../NavigationRoutes'

  const props = withDefaults(
    defineProps<{
      sections?: INavigationSection[]
    }>(),
    {
      sections: () => [],
    },
  )

  const { t } = useI18n()
  // NOTE: resolved once in setup — the previous implementation called useRoute()
  // inside isRouteActive(), i.e. on every render, outside of a setup context.
  const route = useRoute()
  const routeName = computed(() => (route.name ? String(route.name) : null))

  const expanded = reactive<Record<string, boolean>>({})

  // Open the group that owns the current route; never auto-close, so a group the
  // user opened by hand survives navigation.
  watch(
    routeName,
    () => {
      props.sections.forEach((section) =>
        section.items.forEach((item) => {
          if (item.children?.length && isBranchActive(item, routeName.value)) expanded[item.name] = true
        }),
      )
    },
    { immediate: true },
  )
</script>

<style lang="scss">
  .app-menu {
    padding: 0.5rem 0 1.5rem;

    &__section + &__section {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--va-background-border);
    }

    &__section-label {
      padding: 0.75rem 1rem 0.375rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--va-secondary);
      opacity: 0.65;
    }

    &__list,
    &__sublist {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    // Aligns child icons with the parent label rather than the parent icon,
    // so the hierarchy reads without a connector line.
    &__sublist {
      padding-left: 1.5rem;
    }

    &__item {
      margin: 0 0.5rem;
      border-radius: 0.5rem;
      overflow: hidden;
    }

    &__chevron {
      margin-left: auto;
      opacity: 0.5;
    }

    // VaCollapse wraps the header in its own padded container; the sidebar item
    // already owns that padding.
    &__group {
      .va-collapse__header,
      .va-collapse__body-wrapper,
      .va-collapse__body {
        padding: 0;
      }

      // va-collapse sets overflow:auto on the body-wrapper after animation;
      // navigation submenus are never tall enough to need their own scroll.
      .va-collapse__body-wrapper {
        overflow: hidden !important;
      }
    }
  }
</style>
