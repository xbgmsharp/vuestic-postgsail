<template>
  <form @submit.prevent="onsubmit()">
    <va-input
      v-model="email"
      class="mb-3"
      type="email"
      :label="t('auth.email')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
    />

    <va-input
      v-model="vessel_mmsi"
      class="mb-3"
      type="text"
      :label="t('auth.vessel_mmsi')"
      :error="!!mmsiErrors.length"
      :error-messages="mmsiErrors"
    />

    <va-input
      v-model="vessel_name"
      class="mb-3"
      type="test"
      :label="t('auth.vessel_name')"
      :error="!!nameErrors.length"
      :error-messages="nameErrors"
    />

    <div class="d-flex justify--center mt-3">
      <va-button class="my-0" @click="onsubmit">{{ t('auth.vessel_register') }}</va-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  const email = ref('')
  const mmsi = ref('')
  const name = ref('')
  const emailErrors = ref<string[]>([])
  const mmsiErrors = ref<string[]>([])
  const nameErrors = ref<string[]>([])

  const formReady = computed(() => {
    return !(emailErrors.value.length || mmsiErrors.value.length || nameErrors.value.length)
  })

  function onsubmit() {
    if (!formReady.value) return

    emailErrors.value = email.value ? [] : ['Email is required']
    mmsiErrors.value = mmsi.value ? [] : ['mmsi is required']
    nameErrors.value = name.value ? [] : ['name is required']

    useRouter().push({ name: 'dashboard' })
  }
</script>
