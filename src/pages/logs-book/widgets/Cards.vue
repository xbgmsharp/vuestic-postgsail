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

                <!--
                <div class="">
                    <VaButtonDropdown :offset="[13, 0]" stick-to-edges icon="menu">
                    <va-dropdown-content class="">
                      <div class="" style="">
                        <VaButton
                          preset="secondary"
                          icon="edit"
                          size="large"
                          color="secondary"
                          @click="$emit('edit', log)"
                        />
                        <span class="dropdown-item__text"> Edit </span>
                        <VaButton
                          preset="secondary"
                          icon="delete"
                          size="large"
                          color="secondary"
                          @click="$emit('delete', log)"
                        />
                        <span class="dropdown-item__text"> Delete </span>
                      </div>
                    </va-dropdown-content>
                  </VaButtonDropdown>
                </div> -->
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
            <div class="justify-center text-center">
              <p>
                <span class="text-[var(--va-secondary)]">{{ t('logs.log.distance') }}: </span>
                <span>{{ log.distance_format }}</span>
              </p>
              <p>
                <span class="text-[var(--va-secondary)]">{{ t('logs.log.duration') }}: </span>
                <span>{{ log.duration_format }}</span>
              </p>
              <p>
                <span class="text-[var(--va-secondary)]">{{ t('logs.log.from') }}: </span>
                <span>{{ log.from }}</span>
              </p>
              <p>
                <span class="text-[var(--va-secondary)]">{{ t('logs.log.to') }}: </span>
                <span>{{ log.to }}</span>
              </p>
            </div>
          </div>
        </div>
      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No trips</div>
</template>
