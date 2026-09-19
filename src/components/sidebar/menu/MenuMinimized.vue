<!-- src/components/sidebar/menu/MenuRail.vue  (replaces MenuMinimized.vue) -->
<template>
  <nav class="app-rail" :aria-label="t('menu.aria.primary')">
    <template v-for="(section, index) in sections" :key="section.id">
      <hr v-if="index > 0" class="app-rail__divider" aria-hidden="true" />

      <ul class="app-rail__list" :aria-label="t(section.displayName)">
        <li v-for="item in section.items" :key="item.name">
          <!-- Branch: flyout -->
          <va-dropdown
            v-if="item.children?.length"
            v-model="open[item.name]"
            placement="right-start"
            prevent-overflow
            :offset="[0, 6]"
            :close-on-content-click="true"
          >
            <template #anchor>
              <va-sidebar-item
                class="app-rail__item"
                :class="{ 'app-rail__item--open': open[item.name] }"
                :active="isBranchActive(item, routeName)"
                :title="t(item.displayName)"
                :aria-label="t(item.displayName)"
                :aria-expanded="Boolean(open[item.name])"
              >
                <va-sidebar-item-content>
                  <va-icon :name="item.meta.icon" class="va-sidebar-item__icon" />
                </va-sidebar-item-content>
              </va-sidebar-item>
            </template>

            <div class="app-rail__flyout">
              <div class="app-rail__flyout-label">{{ t(item.displayName) }}</div>
              <va-sidebar-item
                v-for="child in item.children"
                :key="child.name"
                class="app-rail__flyout-item"
                :active="isItemActive(child, routeName)"
                :aria-current="isItemActive(child, routeName) ? 'page' : undefined"
                :to="{ name: child.name }"
              >
                <va-sidebar-item-content>
                  <va-icon :name="child.meta.icon" class="va-sidebar-item__icon" />
                  <va-sidebar-item-title>{{ t(child.displayName) }}</va-sidebar-item-title>
                </va-sidebar-item-content>
              </va-sidebar-item>
            </div>
          </va-dropdown>

          <!-- Leaf -->
          <va-sidebar-item
            v-else
            class="app-rail__item"
            :active="isItemActive(item, routeName)"
            :aria-current="isItemActive(item, routeName) ? 'page' : undefined"
            :to="{ name: item.name }"
            :title="t(item.displayName)"
            :aria-label="t(item.displayName)"
          >
            <va-sidebar-item-content>
              <va-icon :name="item.meta.icon" class="va-sidebar-item__icon" />
            </va-sidebar-item-content>
          </va-sidebar-item>
        </li>
      </ul>
    </template>
  </nav>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue'
  import { useRoute } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { INavigationSection, isItemActive, isBranchActive } from '../NavigationRoutes'

  withDefaults(
    defineProps<{
      sections?: INavigationSection[]
    }>(),
    {
      sections: () => [],
    },
  )

  const { t } = useI18n()
  const route = useRoute()
  const routeName = computed(() => (route.name ? String(route.name) : null))

  // Keyed by group id rather than index, so filtered-out items can't shift state
  // onto the wrong group.
  const open = reactive<Record<string, boolean>>({})
</script>

<style lang="scss">
  .app-rail {
    padding: 0.75rem 0 1.5rem;

    &__list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    &__divider {
      width: 2rem;
      margin: 0.5rem auto;
      border: 0;
      border-top: 1px solid var(--va-background-border);
    }

    &__item {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.75rem;
      overflow: hidden;

      .va-sidebar-item-content {
        height: 100%;
        padding: 0;
        justify-content: center;
      }

      // The open group keeps a ring instead of a fill, so it stays legible next
      // to the filled "current page" state.
      &--open {
        box-shadow: inset 0 0 0 2px var(--va-primary);
      }
    }

    &__flyout {
      width: 11em;
      max-height: 60vh;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 0.5rem;
      border-radius: 0.75rem;
      color: var(--va-on-background-primary);
      background: var(--va-background-primary);
      box-shadow: var(--va-box-shadow);

      &-label {
        padding: 0.25rem 0.75rem 0.5rem;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--va-secondary);
        opacity: 0.65;
      }

      &-item {
        border-radius: 0.5rem;
        overflow: hidden;

        .va-sidebar-item-title {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
