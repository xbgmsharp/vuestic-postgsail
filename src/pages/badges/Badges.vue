<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
    <va-card
      v-for="(item, key) in user_badges"
      :key="key"
      :disabled="item.disabled"
      :stripe="!item.disabled"
      stripe-color="success"
    >
      <va-card-title
        ><h2>{{ key }}</h2></va-card-title
      >
      <va-card-content class="col-span-1">
        <p>{{ item.description }}</p>
        <template v-if="item.log">
          <router-link :to="'/log/' + item.log">logbook reference</router-link>
        </template>
        <template v-if="item.date">
          <p>date: {{ item.date }}</p>
        </template>
      </va-card-content>
      <template v-if="item.image">
        <va-image class="max-h-32 col-span-1" fit="contain" :src="item.image" />
      </template>
      <template v-else-if="item.svg">
        <div>
          <IconAward class="max-h-32 col-start-2" fit="contain" />
        </div>
      </template>
      <template v-else>
        <div>
          <IconNavigation class="max-h-32 col-start-2" fit="contain" />
        </div>
      </template>
    </va-card>
  </div>
</template>

<script setup>
  // TODO update setup with lang="ts"
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../stores/global-store'
  import { dateFormat } from '../../utils/dateFormatter'
  import IconAward from '../../components/icons/IconAward.vue'
  import IconNavigation from '../../components/icons/IconNavigation.vue'

  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)

  const { t } = useI18n()
  const isBusy = ref(false)

  const badges = ref({
    Helmsman: { image: '/badges/helmsman.png', description: t('badges.Helmsman') },
    'Wake Maker': { image: '/badges/wake_maker.png', description: t('badges.Wake Maker') },
    Explorer: { image: '/badges/explorer.png', description: t('badges.Explorer') },
    'Mooring Pro': { image: '/badges/mooring_pro.png', description: t('badges.Mooring Pro') },
    Anchormaster: { image: '/badges/anchormaster.png', description: t('badges.Anchormaster') },
    Traveler: { image: '/badges/traveler.png', description: t('badges.Traveler') },
    Stormtrooper: { image: '/badges/storm_trooper.png', description: t('badges.Stormtrooper') },
    'Club Alaska': { image: '/badges/club_alaska.png', description: t('badges.Club Alaska') },
    'Tropical Traveler': { image: '/badges/tropical_traveler.png', description: t('badges.Tropical Traveler') },
    'Navigator Award': { svg: true, description: t('badges.Navigator Award') },
    'Captain Award': { svg: true, description: t('badges.Captain Award') },
  })
  const default_badge = { default: { svg: false, description: t('badges.default') } }
  let user_badges = settings.value.preferences.badges || {}

  onMounted(async () => {
    isBusy.value = true
    for (let key in badges.value) {
      //console.log(key, badges.value[key])
      if (key in user_badges && 'date' in user_badges[key]) {
        user_badges[key] = { ...user_badges[key], ...badges.value[key] }
        user_badges[key]['disabled'] = false
      } else {
        if (key in badges.value) {
          user_badges[key] = badges.value[key]
          user_badges[key]['disabled'] = true
        }
      }
    }
    for (let key in user_badges) {
      if (!(key in badges.value)) {
        user_badges[key] = { ...user_badges[key], ...default_badge['default'] }
        user_badges[key]['disabled'] = false
      }
    }
    console.log(user_badges)
  })
</script>

<style lang="scss" scoped>
  .ribbon-2 {
    --f: 10px; /* control the folded part*/
    --r: 15px; /* control the ribbon shape */
    --t: 10px; /* the top offset */

    position: absolute;
    inset: var(--t) calc(-1 * var(--f)) auto auto;
    padding: 0 10px var(--f) calc(10px + var(--r));
    clip-path: polygon(
      0 0,
      100% 0,
      100% calc(100% - var(--f)),
      calc(100% - var(--f)) 100%,
      calc(100% - var(--f)) calc(100% - var(--f)),
      0 calc(100% - var(--f)),
      var(--r) calc(50% - var(--f) / 2)
    );
    background: #bd1550;
    box-shadow: 0 calc(-1 * var(--f)) 0 inset #0005;
  }
</style>
