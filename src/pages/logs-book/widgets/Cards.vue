<script setup lang="ts">
  import { PropType } from 'vue'
  import { Log } from '../types'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC, durationI18nDaysHours } from '../../../utils/dateFormatter.js'
  import { distanceFormatMiles } from '../../../utils/distanceFormatter.js'
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
                        icon="timelapse"
                        size="medium"
                        color="secondary"
                        @click="$emit('replay', log)"
                      >
                        Replay</VaButton
                      >
                    </div>
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
                  </va-dropdown-content>
                </va-dropdown>
              </div>
            </div>
          </div>
          <!-- Item List -->
          <div class="">
            <h4 class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
              <template v-if="isLoggedIn">
                <router-link :to="{ name: 'log-map', params: { id: log.id } }">
                  {{ log.name }}
                </router-link> </template
              ><template v-else>
                <router-link :to="{ name: 'log-map', params: { boat: publicVessel, id: log.id } }">
                  {{ log.name }}
                </router-link>
              </template>
            </h4>
            <div class="grid grid-cols-2 gap-1 items-center justify-center text-center">
              <span class="label">{{ t('logs.log.distance') }}: </span>
              <span class="value">
                <template v-if="isLoggedIn">
                  <router-link class="va-link link" :to="{ name: 'log-map', params: { id: log.id } }">
                    {{ distanceFormatMiles(log.distance) }}
                  </router-link> </template
                ><template v-else>
                  <router-link
                    class="va-link link"
                    :to="{ name: 'log-map', params: { boat: publicVessel, id: log.id } }"
                  >
                    {{ distanceFormatMiles(log.distance) }}
                  </router-link>
                </template>
              </span>
              <span class="label">{{ t('logs.log.duration') }}: </span>
              <span class="value">
                <template v-if="isLoggedIn">
                  <router-link class="va-link link" :to="{ name: 'log-map', params: { id: log.id } }">
                    {{ durationI18nDaysHours(log.duration) }}
                  </router-link> </template
                ><template v-else>
                  <router-link
                    class="va-link link"
                    :to="{ name: 'log-map', params: { boat: publicVessel, id: log.id } }"
                  >
                    {{ durationI18nDaysHours(log.duration) }}
                  </router-link>
                </template>
              </span>
              <span class="label">{{ t('logs.log.from') }}: </span>
              <span class="value">
                <router-link
                  class="va-link link"
                  :to="{ name: 'moorage-details', params: { id: log.fromMoorageId || 0 } }"
                >
                  {{ log.from }}
                </router-link>
              </span>
              <span class="label">{{ t('logs.log.to') }}: </span>
              <span class="value">
                <router-link
                  class="va-link link"
                  :to="{ name: 'moorage-details', params: { id: log.toMoorageId || 0 } }"
                >
                  {{ log.to }}
                </router-link>
              </span>
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
