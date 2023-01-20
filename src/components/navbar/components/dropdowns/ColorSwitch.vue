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
          <va-icon size="24px" :name="themeOptions.value ? 'dark_mode' : 'light_mode'" />
        </div>
      </template>
    </va-switch>
  </div>
</template>

<script setup lang="ts">
  import { useColors } from 'vuestic-ui'
  import { computed, ref, watchEffect } from 'vue'
  const { presets, applyPreset, colors } = useColors()
  const currentTheme = ref('light')
  watchEffect(() => {
    applyPreset(currentTheme.value)
  })
  const themeOptions = Object.keys(presets.value).map((themeName) => ({
    value: themeName,
    label: themeName,
  }))
  //console.log(presets)
  //console.log(themeOptions)
</script>
