<script setup lang="ts">
  import { PropType } from 'vue'
  import { Log } from '../types'
  import { useI18n } from 'vue-i18n'
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
        <div class="text-[var(--va-secondary)]">{{ log.fromTime }}</div>
        <div class="flex flex-col items-center gap-4 grow">
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
        </div>
        <div>
          <div class="w-full flex items-center justify-between p-2">
            <div class="justify-left">
              <span class="text-[var(--va-secondary)]">{{ t('logs.log.distance') }}: </span>
              <span>{{ log.distance }}</span>
            </div>
            <div class="justify-right">
              <span class="text-[var(--va-secondary)]">{{ t('logs.log.duration') }}: </span>
              <span>{{ log.duration }}</span>
            </div>
          </div>
        </div>
        <div class="w-full flex items-center justify-between p-2">
          <div class="justify-left">
            <span class="text-[var(--va-secondary)]">{{ t('logs.log.from') }}: </span>
            <span
              ><router-link class="va-link link" :to="{ name: 'logs', params: { id: log._from_moorage_id } }">
                {{ log.from }}
              </router-link></span
            >
          </div>
          <div class="justify-right">
            <span class="text-[var(--va-secondary)]">{{ t('logs.log.to') }}: </span>
            <span
              ><router-link class="va-link link" :to="{ name: 'logs', params: { id: log._to_moorage_id } }">
                {{ log.to }}
              </router-link></span
            >
          </div>
        </div>

        <VaDivider class="my-6" />
        <div class="flex justify-between">
          <VaButton preset="secondary" icon="edit" color="secondary" @click="$emit('edit', log)" />
          <VaButton preset="secondary" icon="delete" color="danger" @click="$emit('delete', log)" />
        </div>
      </VaCardContent>
    </VaCard>
  </VaInnerLoading>
  <div v-else class="p-4 flex justify-center items-center text-[var(--va-secondary)]">No trips</div>
</template>
