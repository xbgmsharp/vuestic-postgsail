<script setup lang="ts">
  import { PropType, computed, ref } from 'vue'
  import { useVModel } from '@vueuse/core'
  import { Trip, FormData } from '../types'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  import { seaState, visibility } from '../../../utils/PostgSail'
  import MySelect from '../../../components/vaSelect.vue'
  import PostgSail from '../../../services/api-client'
  import { useCacheStore } from '../../../stores/cache-store'
  const { isLoggedIn, publicVessel, instagram, website } = useGlobalStore()
  const CacheStore = useCacheStore()
  const { t } = useI18n()
  const route = useRoute()
  const props = defineProps({
    logbook: {
      type: Object as PropType<Trip>,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Object as PropType<FormData>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'save', log: Trip): void
    (event: 'delete', log: Trip): void
  }>()

  // handle Observations
  const handleSeaState = async (new_sea_state: number, obj: { value: number; text: string }) => {
    console.log('handleSeaState new_sea_state', new_sea_state, obj)
    if (new_sea_state >= 0) {
      console.log('handleSeaState obj:', obj.value + ', text:' + obj.text)
      var result_obj: any = {}
      result_obj.seaState = new_sea_state
      updateObservations(result_obj)
    }
  }
  const handleVisibility = async (new_visibility: number, obj: { value: number; text: string }) => {
    console.log('handleVisibility', new_visibility, obj)
    if (new_visibility >= 0) {
      console.log('handleVisibility:', obj.value + ', text:' + obj.text)
      var result_obj: any = {}
      result_obj.visibility = new_visibility
      updateObservations(result_obj)
    }
  }

  const cloudCoverage = ref(-1)
  const sliderLabel = computed(() => `${cloudCoverage.value}/8`)
  const handleCloudCoverage = (new_cloudCoverage: number) => {
    console.log('handleCloudCoverage : ', new_cloudCoverage)
    var obj: any = {}
    obj.cloudCoverage = new_cloudCoverage
    updateObservations(obj)
    cloudCoverage.value = new_cloudCoverage
  }
  function updateObservations(new_obs: number) {
    // runBusy handles isBusy & apiError
    console.log('updateObservations', new_obs)
    const id = route.params.id
    new PostgSail()
      .update_observations({ _id: id, observations: { observations: new_obs } })
      .then((response) => {
        console.log('updateObservations success', response)
        // Clean CacheStore and force refresh
        CacheStore.resetCache()
      })
      .catch((err) => {
        console.log('updateObservations failed', err.message ?? err)
        //throw err.message ?? err
      })
  }

  const visibility_value = computed(() => props.logbook.visibility)
</script>

<template>
  <!-- observations section -->
  <div v-if="isLoggedIn && logbook.id > 0" class="">
    <div class="text-xs uppercase mt-4">{{ $t('logs.log.sea_state') }}</div>
    <div>
      <template v-if="isLoggedIn">
        <MySelect
          v-if="props.logbook.seaState"
          :id="props.logbook.seaState"
          :key="props.logbook.seaState"
          :data="props.logbook.seaState"
          :object="seaState"
          @clickFromChildComponent="handleSeaState"
        />
      </template>
      <template v-else>
        {{ logbook.seaState }}
      </template>
    </div>
    <div class="text-xs uppercase my-2">{{ $t('logs.log.cloud_coverage') }}</div>
    <div class="m-4">
      <template v-if="isLoggedIn">
        <va-slider
          v-model="cloudCoverage"
          stateful
          track-label-visible
          invert-label
          :min="-1"
          :max="8"
          :step="1"
          :label="sliderLabel"
          @update:modelValue="handleCloudCoverage"
        >
        </va-slider>
      </template>
      <template v-else>
        {{ cloudCoverage }}
      </template>
    </div>
    <div class="text-xs uppercase my-2">{{ $t('logs.log.visibility') }}</div>
    <div>
      <template v-if="isLoggedIn">
        <MySelect
          v-if="logbook.visibility"
          :id="logbook.visibility"
          :key="logbook.visibility"
          :data="logbook.visibility"
          :object="visibility"
          @clickFromChildComponent="handleVisibility"
        />
      </template>
      <template v-else>
        {{ logbook.visibility }}
      </template>
    </div>
  </div>
</template>
