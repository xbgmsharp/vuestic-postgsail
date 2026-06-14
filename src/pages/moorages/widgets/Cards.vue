<script setup lang="ts">
  import { PropType } from 'vue'
  import { useI18n } from 'vue-i18n'
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
    (event: 'updateDefaultStay', stayCode: number, id: number): void
  }>()
</script>

<template>
  <va-inner-loading
    v-if="items.length > 0 || loading"
    :loading="loading"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[4rem]"
  >
    <va-card
      v-for="moorage in items"
      :key="moorage.id"
      :style="{ '--va-card-outlined-border': '1px solid var(--va-background-element)' }"
      outlined
    >
      <va-card-content class="flex flex-col h-full gap-3">
        <!-- Name -->
        <h4 class="va-h4 text-center self-stretch overflow-hidden line-clamp-2 text-ellipsis">
          <router-link class="" :to="{ name: 'moorage-details', params: { id: moorage.id } }">
            {{ moorage.moorage }}
          </router-link>
        </h4>

        <!-- Default stay type -->
        <div v-if="moorage.default_stay_id" class="flex items-center gap-2">
          <span class="text-[var(--va-secondary)]">{{ t('moorages.list.default_stay') }}:</span>
          <StayAt
            :id="parseInt(moorage.id)"
            :key="moorage.id"
            :data="parseInt(moorage.default_stay_id)"
            @clickFromChildComponent="(code) => $emit('updateDefaultStay', code, moorage.id)"
          />
        </div>

        <!-- Stats row -->
        <div
          class="grid grid-cols-2 gap-1 items-center justify-center text-center mt-auto pt-2 border-t border-[var(--va-background-element)]"
        >
          <span class="label">{{ t('moorages.list.total_stay') }}:</span>
          <span class="value">
            <router-link class="va-link link" :to="{ name: 'moorage-stays', params: { id: moorage.id } }">
              {{ moorage.total_stay }}
            </router-link>
          </span>
          <span class="label">{{ t('moorages.list.arrivals') }}:</span>
          <span class="value">
            <router-link class="va-link link" :to="{ name: 'moorage-arrivals-departures', params: { id: moorage.id } }">
              {{ moorage.arrivals_departures }}
            </router-link>
          </span>
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
