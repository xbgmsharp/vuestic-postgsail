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
  import { ref, watchEffect } from 'vue'
  const { applyPreset } = useColors()
  const currentTheme = ref('light')
  const value = ref(true)
  watchEffect(() => {
    applyPreset(currentTheme.value)
  })
</script>
