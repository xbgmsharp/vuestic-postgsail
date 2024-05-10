<script setup lang="ts">
  import { PropType } from 'vue'
  import { useVModel } from '@vueuse/core'
  import { Trip, FormData } from '../types'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useGlobalStore } from '../../../stores/global-store'
  const { isLoggedIn, publicVessel, instagram, website, readOnly } = useGlobalStore()
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
    tags: {
      type: Array<string>,
      required: true,
    },
  })

  const emit = defineEmits<{
    (event: 'save', log: Trip): void
    (event: 'delete', log: Trip): void
    (event: 'newtag', chip: string): void
    (event: 'rmtag', chip: string): void
    (event: 'updatetag', tags: []): void
  }>()

  const addNewTag = function (newTag: string) {
    emit('newtag', newTag)
  }
  function updateTag(chip: []) {
    emit('updatetag', chip)
  }
</script>

<template>
  <template v-if="isLoggedIn && logbook.id > 0">
    <va-input
      v-model="$props.formData.name"
      outline
      :rules="[(value) => (value && value.length > 0) || 'Field is required']"
      class="text-sm py-2"
      @change="$emit('save', logbook as Trip)"
    /> </template
  ><template v-else>
    {{ logbook.name }}
  </template>

  <div class="relative">
    <div class="absolute">
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="130"
        viewBox="0 0 69.000000 900.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="translate(0.000000,900.000000) scale(0.100000,-0.100000)" fill="#145da0" stroke="none">
          <path
            d="M218 8852 c-47 -22 -74 -47 -107 -97 -23 -35 -26 -50 -26 -126 0 -85 0 -86 43 -142 28 -38 57 -63 87 -77 24 -11 49 -29 55 -39 5 -11 10 -65 10 -120 0 -77 4 -103 16 -115 12 -12 20 -13 35 -6 21 12 22 13 21 130 0 101 10 121 68 139 54 16 118 75 142 131 23 52 26 156 6 192 -31 56 -84 112 -122 129 -55 25 -176 25 -228 1z"
          />
          <path
            d="M296 7904 c-13 -13 -16 -41 -16 -155 0 -78 5 -149 10 -160 13 -23 33 -24 55 -3 22 23 21 296 -2 319 -18 19 -28 19 -47 -1z"
          />
          <path
            d="M289 7339 c-17 -33 -8 -307 11 -319 19 -12 21 -12 40 0 12 7 16 37 18 141 5 168 -1 199 -33 199 -14 0 -29 -9 -36 -21z"
          />
          <path d="M295 6790 c-8 -13 -7 -309 1 -321 10 -16 43 -9 54 10 15 28 13 294 -2 309 -15 15 -45 16 -53 2z" />
          <path
            d="M297 6243 c-4 -3 -7 -80 -7 -169 0 -158 1 -163 22 -170 40 -12 48 17 48 165 0 160 -4 181 -34 181 -13 0 -26 -3 -29 -7z"
          />
          <path
            d="M302 5688 c-17 -17 -17 -309 0 -326 16 -16 23 -15 42 4 13 13 16 42 16 163 0 145 -5 171 -35 171 -6 0 -16 -5 -23 -12z"
          />
          <path
            d="M297 5133 c-4 -3 -7 -77 -7 -164 0 -146 1 -159 19 -169 15 -7 23 -6 35 6 13 13 16 42 16 159 0 79 -3 150 -6 159 -6 16 -45 22 -57 9z"
          />
          <path
            d="M301 4576 c-8 -9 -11 -62 -9 -166 3 -130 6 -154 20 -163 12 -8 21 -7 32 2 13 11 16 39 16 165 0 151 -5 176 -36 176 -6 0 -17 -6 -23 -14z"
          />
          <path
            d="M296 4014 c-3 -9 -6 -83 -6 -164 0 -133 2 -150 18 -159 11 -6 24 -6 35 0 15 9 17 28 17 159 0 81 -3 155 -6 164 -3 9 -16 16 -29 16 -13 0 -26 -7 -29 -16z"
          />
          <path
            d="M301 3466 c-8 -9 -11 -62 -9 -166 3 -130 6 -154 20 -163 12 -8 21 -7 32 2 13 11 16 39 16 165 0 151 -5 176 -36 176 -6 0 -17 -6 -23 -14z"
          />
          <path d="M297 2914 c-10 -10 -8 -306 2 -322 4 -8 19 -12 32 -10 l24 3 0 165 0 165 -25 3 c-14 2 -29 0 -33 -4z" />
          <path
            d="M301 2356 c-8 -9 -11 -62 -9 -166 3 -135 5 -154 21 -164 15 -9 22 -7 37 12 16 19 18 39 16 161 -1 99 -5 143 -15 155 -16 20 -35 21 -50 2z"
          />
          <path
            d="M296 1788 c-3 -13 -6 -85 -6 -160 0 -111 3 -140 16 -152 18 -18 23 -19 44 -6 12 7 16 39 18 154 2 93 -1 152 -8 165 -15 29 -56 28 -64 -1z"
          />
          <path
            d="M296 1234 c-10 -27 -7 -284 4 -305 6 -10 19 -19 30 -19 11 0 24 9 30 19 15 28 13 294 -2 309 -17 17 -55 15 -62 -4z"
          />
          <path
            d="M311 701 c-10 -6 -16 -33 -19 -75 -5 -79 -7 -80 -128 -40 -86 29 -114 28 -114 -7 0 -22 30 -84 66 -134 12 -16 34 -52 48 -80 15 -27 38 -68 51 -90 14 -22 31 -51 37 -65 23 -47 60 -90 79 -90 20 0 55 42 91 110 13 25 36 63 51 85 15 22 27 43 27 48 0 4 17 34 39 66 21 32 49 79 61 105 22 43 23 48 7 63 -15 15 -21 15 -89 -7 -40 -12 -89 -23 -108 -24 l-35 -1 -5 63 c-6 72 -24 95 -59 73z"
          />
        </g>
      </svg>
    </div>
    <div class="ps-8 gap-6">
      <div class="text-xs uppercase">{{ $t('logs.log.from') }}</div>
      <div class="text-base">
        <router-link
          v-if="typeof logbook.id !== 'undefined'"
          class="va-text-bold va-link link"
          :to="{ name: 'moorage-details', params: { id: logbook.from_moorage_id } }"
        >
          {{ logbook.from }}
        </router-link>
      </div>
      <div class="text-sm">{{ logbook.fromTime }}</div>
      <br />
      <div class="text-xs uppercase">{{ $t('logs.log.to') }}</div>
      <div class="text-base">
        <router-link
          v-if="typeof logbook.id !== 'undefined'"
          class="va-text-bold va-link link"
          :to="{ name: 'moorage-details', params: { id: logbook.to_moorage_id } }"
        >
          {{ logbook.to }}
        </router-link>
      </div>
      <div class="text-sm">{{ logbook.toTime }}</div>
    </div>
  </div>
  <div class="mt-2 text-center text-sm">
    <template v-if="isLoggedIn">
      <router-link
        v-if="typeof logbook.id !== 'undefined'"
        class="va-text-bold va-link link"
        :to="{ name: 'timelapse-replay', params: { id: $props.logbook.id } }"
      >
        Replay
      </router-link>
    </template>
    <template v-else>
      <router-link
        v-if="typeof logbook.id !== 'undefined'"
        class="va-text-bold va-link link"
        :to="{
          name: 'timelapse-replay',
          params: { boat: publicVessel, id: logbook.id },
        }"
      >
        Replay
      </router-link>
    </template>
  </div>

  <VaDivider class="my-4" />
  <div class="text-xs uppercase">DISTANCE / DURATION</div>
  <div class="flex items-center">
    <VaIcon class="flex-none" name="route" :size="32" />
    <div class="flex-grow ml-2 text-sm">{{ logbook.distance }} / {{ logbook.duration }}</div>
  </div>

  <div class="text-xs uppercase mt-2">SPEED AVG / MAX</div>
  <div class="flex items-center">
    <VaIcon class="flex-none" name="speed" :size="32" />
    <div class="flex-grow ml-2 text-sm">{{ $props.logbook.avg_speed }} / {{ $props.logbook.max_speed }}</div>
  </div>

  <div class="text-xs uppercase mt-2">WIND AVG / MAX</div>
  <div class="flex items-center">
    <VaIcon class="flex-none" name="air" :size="32" />
    <div class="flex-grow ml-2 text-sm">TODO / {{ $props.logbook.max_wind_speed }}</div>
  </div>

  <div class="text-xs uppercase mt-2">NOTES</div>
  <div class="text-sm">
    <template v-if="isLoggedIn">
      <VaTextarea
        v-model="$props.formData.notes"
        outline
        :placeholder="$t('logs.log.remarks')"
        class="text-sm w-full"
        @change="$emit('save', logbook as Trip)"
      /> </template
    ><template v-else>
      {{ logbook.notes }}
    </template>
  </div>

  <div class="text-xs uppercase mt-2">TAGS</div>
  <div class="">
    <template v-if="isLoggedIn">
      <VaSelect
        v-model="$props.formData.tags"
        :options="$props.tags"
        allow-create="unique"
        multiple
        placeholder="Select or create a tag"
        search-placeholder-text="Search or create a tag"
        @create-new="addNewTag"
        @update:modelValue="updateTag"
      >
        <template #content="{ value }">
          <va-chip
            v-for="chip in value"
            :key="chip"
            size="small"
            class="mr-2"
            closeable
            @update:modelValue="$emit('rmtag', chip as string)"
          >
            {{ chip }}
          </va-chip>
        </template>
      </VaSelect>
    </template>
  </div>

  <VaDivider class="my-6" />
  <template v-if="isLoggedIn">
    <!--
                <div class="flex flex-row pa-2">
                  <va-button :disabled="!canSubmit" @click="handleSubmit">Save</va-button>
                </div>
                -->
    <div class="flex flex-row pa-2">
      <va-button :disable="readOnly" color="danger" @click="$emit('delete', logbook as Trip)"
        >Delete Log Book</va-button
      >
    </div>
  </template>
</template>
