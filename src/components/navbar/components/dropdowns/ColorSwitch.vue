<template>
  <div style="display: flex; align-items: center">
    <va-switch
      v-model="currentTheme"
      color="#5123a1"
      off-color="#ffd300"
      style="--va-switch-checker-background-color: #252723"
      true-value="dark"
      false-value="light"
    >
      <template #innerLabel>
        <div class="va-text-center">
          <va-icon size="24px" :name="value ? 'light_mode' : 'dark_mode'" />
        </div>
      </template>
    </va-switch>
  </div>
</template>

<script setup lang="ts">
  import { useColors } from 'vuestic-ui'
  import { ref, watchEffect, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useGlobalStore } from '../../../../stores/global-store'

  const GlobalStore = useGlobalStore()
  const { applyPreset } = useColors()
  const { currentTheme } = storeToRefs(GlobalStore)
  const value = ref(true)
  watchEffect(() => {
    applyPreset(currentTheme.value)
  })

  function activateDarkMode() {
    console.log('matchMedia ref changed!')
    currentTheme.value = 'dark'
  }
  const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
  darkModePreference.addEventListener('change', (e) => e.matches && activateDarkMode())

  watch(currentTheme, () => {
    console.log('currentTheme ref changed!')
    console.log('currentTheme:', currentTheme.value)
    GlobalStore.$state.currentTheme = currentTheme.value
  })
</script>
