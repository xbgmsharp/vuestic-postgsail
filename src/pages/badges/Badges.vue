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
          <router-link class="va-link link" :to="'/log/' + item.log">logbook reference</router-link>
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
  const user_badges = ref(settings.value.preferences.badges || {})

  onMounted(async () => {
    isBusy.value = true
    console.log('user_badges', user_badges.value)
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
  .link {
    color: blue;
  }
  .link:hover {
    text-decoration: underline blue;
  }
</style>
