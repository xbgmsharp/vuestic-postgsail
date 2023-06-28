<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
    <va-card
      v-for="(item, key) in user_badges"
      :key="key"
      :disabled="item.disabled"
      stripe
      :stripe-color="item.disabled ? 'danger' : 'success'"
      class="box_badge"
    >
      <template v-if="item.disabled">
        <span class="ribbon"
          ><h2 class="txt">{{ t('badges.locked') }}</h2></span
        >
      </template>
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
  import { dateFormatUTC } from '../../utils/dateFormatter'
  import IconAward from '../../components/icons/IconAward.vue'
  import IconNavigation from '../../components/icons/IconNavigation.vue'

  const GlobalStore = useGlobalStore()
  const { settings } = storeToRefs(GlobalStore)

  const { t } = useI18n()
  const isBusy = ref(false)

  const badges = ref({
    Helmsman: { image: 'helmsman.png', description: t('badges.Helmsman') },
    'Wake Maker': { image: 'wake_maker.png', description: t('badges.Wake Maker') },
    Explorer: { image: 'explorer.png', description: t('badges.Explorer') },
    'Mooring Pro': { image: 'mooring_pro.png', description: t('badges.Mooring Pro') },
    Anchormaster: { image: 'anchormaster.png', description: t('badges.Anchormaster') },
    Traveler: { image: 'traveler.png', description: t('badges.Traveler') },
    Stormtrooper: { image: 'storm_trooper.png', description: t('badges.Stormtrooper') },
    'Club Alaska': { image: 'club_alaska.png', description: t('badges.Club Alaska') },
    'Tropical Traveler': { image: 'tropical_traveler.png', description: t('badges.Tropical Traveler') },
    'Navigator Award': { svg: true, description: t('badges.Navigator Award') },
    'Captain Award': { svg: true, description: t('badges.Captain Award') },
  })
  const default_badge = { default: { svg: false, description: t('badges.default') } }
  const user_badges = ref(settings.value.preferences.badges || {})

  onMounted(async () => {
    isBusy.value = true
    for (let key in badges.value) {
      //console.log(key, badges.value[key])
      if (key in user_badges.value && 'date' in user_badges.value[key]) {
        user_badges.value[key] = { ...user_badges.value[key], ...badges.value[key] }
        user_badges.value[key]['disabled'] = false
        user_badges.value[key]['date'] = dateFormatUTC(user_badges.value[key]['date'])
      } else {
        if (key in badges.value) {
          user_badges.value[key] = badges.value[key]
          user_badges.value[key]['disabled'] = true
        }
      }
    }
    for (let key in user_badges.value) {
      if (!(key in badges.value)) {
        user_badges.value[key] = { ...user_badges.value[key], ...default_badge['default'] }
        user_badges.value[key]['description'] = `${default_badge['default']['description']} ${key}!`
        user_badges.value[key]['disabled'] = false
        user_badges.value[key]['date'] = dateFormatUTC(user_badges.value[key]['date'])
      }
    }
    console.log(user_badges.value)
  })
</script>

<style lang="scss" scoped>
  .box_badge {
    position: relative;
  }
  .ribbon {
    -webkit-transform: rotate(-45deg);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    transform: rotate(-45deg);
    border: 25px solid transparent;
    border-top: 25px solid #ff0000;
    position: absolute;
    bottom: 0;
    right: -35px;
    padding: 0 10px;
    width: 120px;
    color: white;
    font-family: sans-serif;
    size: 11px;
    opacity: 1;
  }
  .ribbon .txt {
    position: absolute;
    top: -25px;
    left: 0;
    opacity: 1;
  }
</style>
