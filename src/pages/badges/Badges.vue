<template>
  <div class="badges-page">
    <section v-for="cat in orderedCategories" :key="cat.name" class="badge-category">
      <div class="badge-category__header">
        <h2 class="badge-category__title">{{ t(`badges.${cat.name}`, cat.name) }}</h2>
        <span class="badge-category__progress">{{ cat.earned }} / {{ cat.total }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
        <va-card
          v-for="(item, key) in cat.items"
          :key="key"
          class="badge-card"
          :class="{ 'badge-card--locked': item.disabled }"
        >
          <va-card-content class="badge-card__content">
            <!-- Medallion -->
            <div class="badge-medal-wrap">
              <div class="badge-medal" :class="item.disabled ? 'badge-medal--locked' : 'badge-medal--earned'">
                <template v-if="item.image">
                  <va-image class="badge-medal__img" fit="cover" :src="item.image" />
                </template>
                <template v-else-if="item.icon">
                  <va-icon :name="item.icon" :size="76" class="badge-medal__icon" />
                </template>
                <template v-else-if="item.svg">
                  <IconAward class="badge-medal__svg" />
                </template>
                <template v-else>
                  <IconNavigation class="badge-medal__svg" />
                </template>
              </div>
              <div v-if="item.disabled" class="badge-lock" :aria-label="t('badges.locked')">
                <va-icon name="lock" :size="13" />
              </div>
            </div>

            <!-- Title & status -->
            <h3 class="badge-title">{{ key }}</h3>
            <span class="badge-status" :class="item.disabled ? 'badge-status--locked' : 'badge-status--earned'">
              {{ item.disabled ? t('badges.locked') : t('badges.earned') }}
            </span>

            <!-- Description -->
            <p class="badge-desc">
              <template v-if="item.i18n == false">{{ t('badges.default') }} {{ key }}.</template>
              <template v-else>{{ t(`badges.${key}`) }}</template>
            </p>

            <!-- Meta row -->
            <div v-if="item.log || item.date" class="badge-meta">
              <router-link v-if="item.log" class="badge-meta__link" :to="'/log/' + item.log">
                {{ t('badges.log_ref') }}
              </router-link>
              <span v-if="item.date" class="badge-meta__date">{{ item.date }}</span>
            </div>
            <div v-if="item.distance_nm" class="badge-meta">
              {{ t('logs.log.distance') }}<span class="badge-meta__date">{{ item.distance_nm }} nm</span>
            </div>
          </va-card-content>
        </va-card>
      </div>
    </section>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { computed, defineAsyncComponent } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  const IconAward = defineAsyncComponent(() => import('../../components/icons/IconAward.vue'))
  const IconNavigation = defineAsyncComponent(() => import('../../components/icons/IconNavigation.vue'))

  const GlobalStore = useGlobalStore()
  const { userBadges } = storeToRefs(GlobalStore)

  const { t } = useI18n()

  // Fixed display order; any badge without a matching category (legacy/未分类) falls into 'Other'
  const CATEGORY_ORDER = ['Milestones', 'Seamanship', 'World & Regions', 'Other']

  const orderedCategories = computed(() => {
    const groups = {}
    for (const key in userBadges.value) {
      const item = userBadges.value[key]
      const catName = CATEGORY_ORDER.includes(item.category) ? item.category : 'Other'
      if (!groups[catName]) groups[catName] = {}
      groups[catName][key] = item
    }

    return CATEGORY_ORDER.filter((name) => groups[name] && Object.keys(groups[name]).length > 0).map((name) => {
      const items = groups[name]
      const total = Object.keys(items).length
      const earned = Object.values(items).filter((i) => !i.disabled).length
      return { name, items, total, earned }
    })
  })
</script>

<style lang="scss" scoped>
  .badges-page {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .badge-category__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--va-background-border);
  }

  .badge-category__title {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 0;
  }

  .badge-category__progress {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--va-text-secondary);
  }

  .badge-card {
    position: relative;
    text-align: center;
    border-radius: 18px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
    }

    &--locked:hover {
      transform: none;
      box-shadow: none;
    }
  }

  .badge-card__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.75rem 1.25rem 1.5rem;
  }

  // --- Medallion ---
  .badge-medal-wrap {
    position: relative;
    width: 128px;
    height: 128px;
    margin-bottom: 1rem;
  }

  .badge-medal {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: var(--va-background-element);
    transition: transform 0.25s ease;
  }

  .badge-card:hover .badge-medal--earned {
    transform: scale(1.05);
  }

  .badge-medal--earned {
    border: 3px solid transparent;
    background-image: linear-gradient(var(--va-background-element), var(--va-background-element)),
      conic-gradient(from 200deg, var(--va-success), var(--va-primary), var(--va-success));
    background-origin: border-box;
    background-clip: padding-box, border-box;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }

  .badge-medal--locked {
    border: 3px solid var(--va-background-border);
    filter: grayscale(1);
    opacity: 0.55;
  }

  .badge-medal__img {
    width: 100%;
    height: 100%;
  }

  .badge-medal__icon {
    color: var(--va-primary);
  }

  .badge-medal--locked .badge-medal__icon {
    color: var(--va-text-secondary);
  }

  // Bumped up from 60px so SVG badges read at the same visual weight as the
  // image-based medallions, which fill the full 128px circle (fit: cover).
  .badge-medal__svg {
    width: 84px;
    height: 84px;
    color: var(--va-primary);
  }

  .badge-lock {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--va-danger);
    color: var(--va-white, #fff);
    border: 2px solid var(--va-background-primary);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  // --- Text ---
  .badge-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0 0 0.35rem;
  }

  .badge-status {
    display: inline-block;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.2rem 0.65rem;
    border-radius: 999px;
    margin-bottom: 0.75rem;
  }

  .badge-status--earned {
    color: var(--va-success);
    background: color-mix(in srgb, var(--va-success) 14%, transparent);
  }

  .badge-status--locked {
    color: var(--va-text-secondary);
    background: color-mix(in srgb, var(--va-text-secondary) 12%, transparent);
  }

  .badge-desc {
    font-size: 0.92rem;
    color: var(--va-text-secondary);
    line-height: 1.45;
    margin: 0;
  }

  .badge-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }

  .badge-meta__link {
    color: var(--va-primary);
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }

  .badge-meta__date {
    color: var(--va-text-secondary);
  }
</style>
