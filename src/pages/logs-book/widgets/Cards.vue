<script setup lang="ts">
  import { PropType } from 'vue'
  import { Log } from '../types'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import { useGlobalStore } from '../../../stores/global-store'
  const { isLoggedIn, publicVessel } = useGlobalStore()
  const { t } = useI18n()

  defineProps({
    logbook: {
      type: Array as PropType<Log[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  })

  defineEmits<{
    (event: 'edit', log: Log): void
    (event: 'delete', log: Log): void
    (event: 'replay', log: Log): void
  }>()
</script>

<template>
  <VaInnerLoading
    v-if="logbook.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <VaCard
      v-for="log in logbook"
      :key="log.id"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <VaCardContent class="flex flex-col h-full">
        <div class="">
          <!-- Date and Icon Menu -->
          <div class="flex text-sm">
            <div class="text-[var(--va-secondary)] flow-root">
              <div class="float-left">{{ dateFormatUTC(log.fromTime) }}</div>
              <div class="float-right">
                <va-dropdown class="">
                  <template #anchor>
                    <va-icon name="menu" />
                  </template>
                  <va-dropdown-content class="float-left">
                    <div class="grid grid-cols-1">
                      <VaButton
                        preset="secondary"
                        icon="edit"
                        size="medium"
                        color="secondary"
                        @click="$emit('edit', log)"
                      >
                        Edit</VaButton
                      >
                    </div>
                    <div class="grid grid-cols-1">
                      <VaButton
                        preset="secondary"
                        icon="delete"
                        size="medium"
                        color="secondary"
                        @click="$emit('delete', log)"
                      >
                        Delete</VaButton
                      >
                    </div>
                    <div class="grid grid-cols-1">
                      <VaButton
                        preset="secondary"
                        icon="timelapse"
                        size="medium"
                        color="secondary"
                        @click="$emit('replay', log)"
                      >
                        Replay</VaButton
                      >
                    </div>
                  </va-dropdown-content>
                </va-dropdown>
              </div>
            </div>
          </div>
          <!-- Item List -->
          <div class="">
            <h4 class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
              <template v-if="isLoggedIn">
                <router-link :to="{ name: 'log-details', params: { id: log.id } }">
                  {{ log.name }}
                </router-link> </template
              ><template v-else>
                <router-link :to="{ name: 'log-details', params: { boat: publicVessel, id: log.id } }">
                  {{ log.name }}
                </router-link>
              </template>
            </h4>
            <div class="grid grid-cols-2 gap-1 items-center justify-center text-center">
              <span class="label">{{ t('logs.log.distance') }}: </span>
              <span class="value">{{ log.distance }} {{ t('units.distance.miles') }}</span>
              <span class="label">{{ t('logs.log.duration') }}: </span>
              <span class="value">{{ log.duration }} {{ t('units.time.hours') }} </span>
              <span class="label">{{ t('logs.log.from') }}: </span>
              <span class="value">{{ log.from }}</span>
              <span class="label">{{ t('logs.log.to') }}: </span>
              <span class="value">{{ log.to }}</span>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No trips</div>
</template>

<style lang="scss" scoped>
  .label {
    text-align: end;
    color: var(--va-secondary);
  }
  .value {
    text-align: start;
  }
</style>
