<script setup lang="ts">
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { dateFormatUTC } from '../../../utils/dateFormatter.js'
  import StayAt from '../../../components/SelectStayAt.vue'

  const { t } = useI18n()

  defineProps({
    items: {
      type: Array as PropType<any[]>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
  })

  defineEmits<{
    (event: 'updateStayedAt', stayCode: number, id: number): void
  }>()
</script>

<template>
  <va-inner-loading
    v-if="items.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <va-card
      v-for="stay in items"
      :key="stay.id"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <va-card-content class="flex flex-col h-full gap-3">
        <!-- Name -->
        <h4 class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
          <router-link :to="{ name: 'stay-details', params: { id: stay.id } }">
            {{ stay.name || stay.moorage }}
          </router-link>
        </h4>

        <!-- Moorage -->
        <div v-if="stay.moorage" class="flex items-center gap-2 text-sm">
          <span class="text-[var(--va-secondary)]">{{ t('stays.stay.moorage') }}:</span>
          <router-link
            v-if="stay.moorage_id"
            class="va-link link"
            :to="{ name: 'moorage-details', params: { id: stay.moorage_id } }"
          >
            {{ stay.moorage }}
          </router-link>
          <span v-else>{{ stay.moorage }}</span>
        </div>

        <!-- Stay type -->
        <div v-if="stay.stayed_at_id" class="flex items-center gap-2">
          <span class="text-[var(--va-secondary)] text-sm">{{ t('stays.stay.stayed_at') }}:</span>
          <StayAt
            :id="parseInt(stay.id)"
            :key="stay.id"
            :data="parseInt(stay.stayed_at_id)"
            @clickFromChildComponent="(code) => $emit('updateStayedAt', code, stay.id)"
          />
        </div>

        <!-- Stats row -->
        <div
          class="grid grid-cols-2 gap-1 items-center justify-center text-center mt-auto pt-2 border-t border-[var(--va-background-element)]"
        >
          <span class="label">{{ t('stays.stay.arrived') }}:</span>
          <span class="value">
            <router-link
              v-if="stay.departed_log_id"
              class="va-link link"
              :to="{ name: 'log-map', params: { id: stay.departed_log_id } }"
            >
              {{ dateFormatUTC(stay.arrived) }}
            </router-link>
            <span v-else>{{ dateFormatUTC(stay.arrived) }}</span>
          </span>
          <span class="label">{{ t('stays.stay.departed') }}:</span>
          <span class="value">
            <router-link
              v-if="stay.arrived_log_id"
              class="va-link link"
              :to="{ name: 'log-map', params: { id: stay.arrived_log_id } }"
            >
              {{ dateFormatUTC(stay.departed) }}
            </router-link>
            <span v-else>{{ dateFormatUTC(stay.departed) }}</span>
          </span>
          <span class="label">{{ t('stays.stay.duration_d') }}:</span>
          <span class="value">{{ stay.duration }}</span>
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>
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
