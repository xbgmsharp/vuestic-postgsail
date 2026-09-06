<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import { useFollowMutation } from '../../queries/friends'

  const model = defineModel<boolean>({ required: true })

  const { t } = useI18n()
  const { init: notify } = useToast()
  const { mutateAsync: followMmsi, isPending } = useFollowMutation()

  const rawMmsiInput = ref('')
  const submitting = ref(false)

  const parsedMmsiList = computed(() =>
    rawMmsiInput.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0),
  )

  const hasInvalidMmsi = computed(() => {
    const entries = rawMmsiInput.value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return entries.length > 0 && entries.length !== parsedMmsiList.value.length
  })

  async function submitFollow() {
    if (!parsedMmsiList.value.length) return
    submitting.value = true
    try {
      for (const mmsi of parsedMmsiList.value) {
        await followMmsi(mmsi)
      }
      notify({ message: t('friends.follow_modal.success'), color: 'success' })
      rawMmsiInput.value = ''
      model.value = false
    } catch {
      notify({ message: t('friends.follow_modal.error'), color: 'danger' })
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <VaModal v-model="model" :title="t('friends.follow_modal.title')" hide-default-actions close-button>
    <p class="va-text-secondary mb-4">{{ t('friends.follow_modal.description') }}</p>
    <VaInput
      v-model="rawMmsiInput"
      :label="t('friends.follow_modal.mmsi_label')"
      placeholder="232025842, 244660948"
      :error="hasInvalidMmsi"
      :error-messages="hasInvalidMmsi ? [t('friends.follow_modal.invalid_mmsi')] : []"
    />
    <template #footer>
      <div class="flex justify-end gap-2">
        <VaButton preset="secondary" round @click="model = false">
          {{ t('friends.follow_modal.cancel') }}
        </VaButton>
        <VaButton round :disabled="!parsedMmsiList.length" :loading="submitting || isPending" @click="submitFollow">
          {{ t('friends.follow_modal.submit') }}
        </VaButton>
      </div>
    </template>
  </VaModal>
</template>
