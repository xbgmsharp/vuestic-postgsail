<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { useRenameFollowMutation, useFollowAlertsMutation, useUnfollowMutation } from '../../queries/friends'
  import type { Friend } from '../../queries/friends'

  const props = defineProps<{ friend: Friend | null }>()
  const emit = defineEmits<{ close: [] }>()

  const { t } = useI18n()
  const { init: notify } = useToast()

  const { mutateAsync: renameFollow } = useRenameFollowMutation()
  const { mutateAsync: setAlerts, isPending: savingAlerts } = useFollowAlertsMutation()
  const { mutateAsync: unfollow, isPending: unfollowing } = useUnfollowMutation()

  const detailsLabel = ref('')
  const departureAlert = ref(true)
  const arrivalAlert = ref(true)
  const proximityNm = ref(0)
  const confirmingUnfollow = ref(false)

  watch(
    () => props.friend,
    (f) => {
      detailsLabel.value = f?.label ?? ''
      departureAlert.value = f?.alerts?.departure ?? true
      arrivalAlert.value = f?.alerts?.arrival ?? true
      proximityNm.value = f?.alerts?.proximity_nm ?? 0
      confirmingUnfollow.value = false
    },
    { immediate: true },
  )

  function currentAlerts() {
    return {
      departure: departureAlert.value,
      arrival: arrivalAlert.value,
      proximity_nm: proximityNm.value,
    }
  }

  async function saveLabel() {
    if (!props.friend) return
    await renameFollow({ id: props.friend.id, label: detailsLabel.value })
    notify({ message: t('friends.details.renamed'), color: 'success' })
  }

  async function toggleDepartureAlert(value: boolean) {
    if (!props.friend) return
    departureAlert.value = value
    await setAlerts({ id: props.friend.id, alerts: currentAlerts() })
  }

  async function toggleArrivalAlert(value: boolean) {
    if (!props.friend) return
    arrivalAlert.value = value
    await setAlerts({ id: props.friend.id, alerts: currentAlerts() })
  }

  async function saveProximity() {
    if (!props.friend) return
    await setAlerts({ id: props.friend.id, alerts: currentAlerts() })
  }

  async function handleUnfollow() {
    if (!props.friend) return
    await unfollow(props.friend.mmsi)
    notify({ message: t('friends.details.unfollowed'), color: 'success' })
    emit('close')
  }
</script>

<template>
  <VaModal
    :model-value="!!friend"
    :title="friend?.label || String(friend?.mmsi ?? '')"
    hide-default-actions
    close-button
    @update:model-value="(v) => !v && emit('close')"
  >
    <template v-if="friend">
      <div class="flex flex-col gap-4">
        <VaInput v-model="detailsLabel" :label="t('friends.details.label')" @blur="saveLabel" />

        <div class="va-text-secondary text-sm flex flex-col gap-1">
          <span>{{ t('friends.details.mmsi') }}: {{ friend.mmsi }}</span>
          <span v-if="friend.status">{{ t('friends.details.status') }}: {{ friend.status }}</span>
          <span v-if="friend.distance_nm != null">
            {{ t('friends.details.distance') }}: {{ friend.distance_nm }} nm
          </span>
          <span v-if="friend.last_contact">
            {{ t('friends.details.last_contact') }}: {{ dateFormatUTC(friend.position_time) }}
          </span>
        </div>

        <VaDivider />

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <span>{{ t('friends.details.arrival_alert') }}</span>
            <VaSwitch
              class="flex-shrink-0"
              :model-value="arrivalAlert"
              :loading="savingAlerts"
              @update:model-value="toggleArrivalAlert"
            />
          </div>
          <div class="flex items-center justify-between gap-3">
            <span>{{ t('friends.details.departure_alert') }}</span>
            <VaSwitch
              class="flex-shrink-0"
              :model-value="departureAlert"
              :loading="savingAlerts"
              @update:model-value="toggleDepartureAlert"
            />
          </div>
          <VaInput
            v-model.number="proximityNm"
            type="number"
            min="0"
            :label="t('friends.details.proximity_alert')"
            :messages="[t('friends.details.proximity_hint')]"
            @blur="saveProximity"
          />
        </div>

        <VaDivider />

        <div v-if="!confirmingUnfollow" class="flex justify-between flex-wrap gap-2">
          <VaButton preset="secondary" round @click="emit('close')">
            {{ t('modals.close') }}
          </VaButton>
          <VaButton preset="secondary" color="danger" round @click="confirmingUnfollow = true">
            {{ t('friends.details.unfollow') }}
          </VaButton>
        </div>
        <div v-else class="flex flex-wrap justify-end gap-2 items-center">
          <span class="va-text-secondary text-sm w-full sm:w-auto sm:flex-1 sm:min-w-0">
            {{ t('friends.details.unfollow_confirm') }}
          </span>
          <VaButton preset="secondary" round @click="confirmingUnfollow = false">
            {{ t('friends.follow_modal.cancel') }}
          </VaButton>
          <VaButton color="danger" round :loading="unfollowing" @click="handleUnfollow">
            {{ t('friends.details.unfollow') }}
          </VaButton>
        </div>
      </div>
    </template>
  </VaModal>
</template>

<style scoped>
  /*
  VaSwitch's internal track renders both on/off states side-by-side
  (scrollWidth exactly 2x clientWidth on .va-switch__container), relying on
  overflow:hidden to clip to the visible half. Restoring that here since it
  appears to be missing/overridden elsewhere in the app's global CSS.
*/
  :deep(.va-switch__container) {
    overflow: hidden;
  }
</style>
