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
  <va-inner-loading
    v-if="logbook.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <va-card
      v-for="log in logbook"
      :key="log.id"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <va-card-content class="flex flex-col h-full">
        <div class="">
          <!-- Date and Icon Menu -->
          <div class="flex text-sm">
            <div class="text-[var(--va-secondary)] flow-root">
              <div class="float-left">{{ dateFormatUTC(log.fromTime) }}</div>
              <div class="float-right flex justify-end items-center">
                <va-dropdown class="relative">
                  <template #anchor>
                    <va-icon name="more_vert" />
                  </template>
                  <va-dropdown-content class="absolute right-0 origin-top-right w-40">
                    <div class="py-1">
                      <va-button preset="secondary" icon="timelapse" color="secondary" @click="$emit('replay', log)">
                        Replay
                      </va-button>
                      <va-button preset="secondary" icon="edit" color="secondary" @click="$emit('edit', log)">
                        Edit
                      </va-button>
                      <va-button preset="secondary" icon="delete" color="secondary" @click="$emit('delete', log)">
                        Delete
                      </va-button>
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
            <div v-if="log.tags" class="flex items-center justify-center mb-1">
              <va-chip
                v-for="chip in log.tags.slice(0, 2)"
                :key="chip"
                size="small"
                outline
                class="flex-grow-0 flex-shrink text-sm mr-1"
              >
                {{ chip }}
              </va-chip>
              <span
                v-if="log.tags.length > 2"
                class="flex-grow-0 flex-shrink text-xs bg-blue-200 text-gray-800 py-1 px-2 rounded-full"
              >
                +{{ log.tags.length - 2 }}</span
              >
            </div>
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
      </va-card-content>
    </va-card>
  </va-inner-loading>
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
