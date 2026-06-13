<template>
  <div class="p-4 dark:text-white">
    <!-- Edit form -->
    <va-card class="shadow-lg rounded-lg">
      <va-card-title>{{ $t('boats.boat.spec.title') }}</va-card-title>
      <va-card-content class="mb-4">
        <div class="p-4 space-y-4 rounded transition">
          <template v-if="apiError">
            <va-alert color="danger" outline class="mb-4"> {{ $t('api.error') }}: {{ apiError }} </va-alert>
          </template>
          <va-inner-loading :loading="isBusy">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {{ $t('boats.boat.spec.permalink_label') }}
                </label>
                <va-input
                  v-model="formData.spec_permalink"
                  :placeholder="$t('boats.boat.spec.permalink_placeholder')"
                  class="w-full"
                />
                <p class="text-sm text-gray-400 mt-1">
                  {{ $t('boats.boat.spec.permalink_hint') }}
                  <a href="https://sailboatdata.com" target="_blank" class="text-blue-500 hover:underline">
                    sailboatdata.com <va-icon name="launch" size="small" />
                  </a>
                </p>
              </div>

              <va-alert color="info" outline class="mb-4">{{ $t('boats.boat.spec.message') }}</va-alert>
              <p class="text-sm text-gray-400">{{ $t('boats.boat.last_updated') }}: {{ lastUpdated }}</p>
              <va-button color="primary" size="medium" class="my-button pa-2 p-2" @click="handleSubmit">
                {{ $t('boats.boat.spec.submit') }}
              </va-button>
            </div>
          </va-inner-loading>
        </div>
      </va-card-content>
    </va-card>

    <!-- Spec display -->
    <template v-if="spec">
      <va-card class="shadow-lg rounded-lg mt-4">
        <va-card-title>{{ spec.title }}</va-card-title>
        <va-card-content>
          <div class="flex flex-col md:flex-row gap-4 p-2">
            <img
              v-if="spec.thumbnail"
              :src="spec.thumbnail"
              :alt="spec.title"
              class="rounded w-full md:w-48 object-cover self-start"
            />
            <div class="flex-1 space-y-1 text-sm">
              <p v-if="spec.designer"><span class="font-semibold">Designer:</span> {{ spec.designer }}</p>
              <p v-if="spec.rig_type"><span class="font-semibold">Rig:</span> {{ spec.rig_type }}</p>
              <p v-if="spec.hull_type"><span class="font-semibold">Hull:</span> {{ spec.hull_type }}</p>
              <p v-if="spec.first_built || spec.last_built">
                <span class="font-semibold">Built:</span>
                {{ spec.first_built }}{{ spec.last_built ? ' – ' + spec.last_built : '' }}
              </p>
              <p v-if="spec.source_url">
                <a :href="spec.source_url" target="_blank" class="text-blue-500 hover:underline">
                  {{ spec.source_url }} <va-icon name="launch" size="small" />
                </a>
              </p>
            </div>
          </div>

          <div v-if="spec.content" class="p-2 mt-2 text-sm text-gray-700 dark:text-gray-300" v-html="spec.content" />

          <!-- Dimensions -->
          <div class="mt-4 p-2">
            <h3 class="font-semibold text-base mb-2">Dimensions</h3>
            <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              <template v-for="(label, key) in dimensionFields" :key="key">
                <div v-if="spec[key] != null" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                  <dt class="font-semibold text-gray-600 dark:text-gray-400">{{ label }}</dt>
                  <dd>{{ spec[key] }}</dd>
                </div>
              </template>
            </dl>
          </div>

          <!-- Rig -->
          <div class="mt-4 p-2">
            <h3 class="font-semibold text-base mb-2">Rig</h3>
            <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              <template v-for="(label, key) in rigFields" :key="key">
                <div v-if="spec[key] != null" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                  <dt class="font-semibold text-gray-600 dark:text-gray-400">{{ label }}</dt>
                  <dd>{{ spec[key] }}</dd>
                </div>
              </template>
            </dl>
          </div>

          <!-- Performance ratios -->
          <div class="mt-4 p-2">
            <h3 class="font-semibold text-base mb-2">Performance Ratios</h3>
            <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              <template v-for="(label, key) in ratioFields" :key="key">
                <div v-if="spec[key] != null" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                  <dt class="font-semibold text-gray-600 dark:text-gray-400">{{ label }}</dt>
                  <dd>{{ spec[key] }}</dd>
                </div>
              </template>
            </dl>
          </div>

          <!-- Engine -->
          <div v-if="spec.engine_make || spec.engine_model || spec.engine_type" class="mt-4 p-2">
            <h3 class="font-semibold text-base mb-2">Engine</h3>
            <dl class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
              <div v-if="spec.engine_make" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                <dt class="font-semibold text-gray-600 dark:text-gray-400">Make</dt>
                <dd>{{ spec.engine_make }}</dd>
              </div>
              <div v-if="spec.engine_model" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                <dt class="font-semibold text-gray-600 dark:text-gray-400">Model</dt>
                <dd>{{ spec.engine_model }}</dd>
              </div>
              <div v-if="spec.engine_type" class="hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                <dt class="font-semibold text-gray-600 dark:text-gray-400">Type</dt>
                <dd>{{ spec.engine_type }}</dd>
              </div>
            </dl>
          </div>

          <p v-if="spec.enriched_at" class="text-xs text-gray-400 mt-4 p-2">
            Fetched from {{ spec.source }} on {{ dateFormatUTC(spec.enriched_at) }}
          </p>
        </va-card-content>
      </va-card>
    </template>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { setAppTitle } from '../../utils/app.js'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { useToast } from 'vuestic-ui'
  import { useVesselStore } from '../../stores/vessel-store'

  const { t } = useI18n()
  const { init: initToast } = useToast()
  const { vesselId } = useVesselStore()
  const isBusy = ref(false)
  const apiError = ref(null)
  const lastUpdated = ref(null)
  const spec = ref(null)
  const hasImages = ref(false)
  const formData = ref({
    spec_permalink: '',
  })

  const dimensionFields = {
    loa_m: 'LOA (m)',
    lwl_m: 'LWL (m)',
    beam_m: 'Beam (m)',
    max_draft_m: 'Max Draft (m)',
    min_draft_m: 'Min Draft (m)',
    displacement_kg: 'Displacement (kg)',
    ballast_kg: 'Ballast (kg)',
    sail_area_m2: 'Sail Area (m²)',
  }

  const rigFields = {
    rig_p_m: 'P (m)',
    rig_e_m: 'E (m)',
    rig_i_m: 'I (m)',
    rig_j_m: 'J (m)',
  }

  const ratioFields = {
    capsize_ratio: 'Capsize Ratio',
    comfort_ratio: 'Comfort Ratio',
    hull_speed_kn: 'Hull Speed (kn)',
    sa_disp_ratio: 'SA/Disp',
    bal_disp_ratio: 'Bal/Disp',
    disp_len_ratio: 'Disp/Length',
  }

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.vessel_get()
      if (response && response.vessel) {
        const vessel = response.vessel
        document.title = setAppTitle(t('boats.boat.spec.title'))
        formData.value.spec_permalink = vessel.spec?.permalink ?? ''
        lastUpdated.value = vessel.spec?.enriched_at ? dateFormatUTC(vessel.spec?.enriched_at) : '-'
        spec.value = vessel.spec ?? null
        hasImages.value = vessel.has_images ?? false
      } else {
        throw { response }
      }
    } catch (err) {
      apiError.value = err?.response?.message ?? err
    } finally {
      isBusy.value = false
    }
  })

  function extractSlug(permalink) {
    try {
      const parts = new URL(permalink).pathname.split('/').filter(Boolean)
      return parts[parts.length - 1]
    } catch {
      return permalink.trim()
    }
  }

  async function uploadThumbnail(api, thumbnailUrl) {
    const imgResponse = await fetch(thumbnailUrl)
    if (!imgResponse.ok) throw new Error('Failed to fetch thumbnail')
    const blob = await imgResponse.blob()
    const imageType = blob.type || 'image/jpeg'

    const presignedUrl = await api.getPresignedUploadUrl({
      _image_type: imageType,
      _id: null,
      _type: 'vessel',
      _vessel_id: vesselId,
      _idx: null,
    })

    const putResult = await fetch(presignedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': imageType },
      body: blob,
    })
    if (!putResult.ok) throw new Error(`Thumbnail upload failed: ${putResult.statusText}`)

    const image_url = presignedUrl.split('?')[0]
    await api.image_update({
      _image_type: imageType,
      _id: null,
      _type: 'vessel',
      _vessel_id: vesselId,
      _image_url: image_url,
    })
    hasImages.value = true
  }

  const handleSubmit = async () => {
    isBusy.value = true
    apiError.value = null

    const api = new PostgSail()
    const slug = extractSlug(formData.value.spec_permalink.trim())
    try {
      // Step 1: fetch JSON spec and HTML content in parallel
      const [specResult, htmlResult] = await Promise.all([
        api.vessel_search_specs(slug),
        api.vessel_search_specs_html(slug).catch(() => null),
      ])
      if (!specResult) throw new Error('No spec data returned')

      // Step 2: if algolia_id is present, fetch by post ID and merge (post ID is the part before the '-')
      const specData = Array.isArray(specResult) ? specResult[0] : specResult
      if (specData?.algolia_id) {
        const postId = specData.algolia_id.split('-')[0]
        const idResult = await api.vessel_search_specs_id(postId).catch(() => null)
        const idData = idResult ? (Array.isArray(idResult) ? idResult[0] : idResult) : null
        if (idData) Object.assign(specData, idData)
      }

      // Step 3: merge HTML — enriches content field if longer
      const htmlData = htmlResult ? (Array.isArray(htmlResult) ? htmlResult[0] : htmlResult) : null
      if (htmlData?.content && htmlData.content.length > (specData.content?.length ?? 0)) {
        specData.content = htmlData.content
      }
      if (!specData.permalink) {
        specData.permalink = formData.value.spec_permalink.trim()
      }
      specData.enriched_at = new Date().toISOString()
      await api.vessel_update({ userdata: { spec: specData } })

      // Step 3: reload vessel to get the enriched spec as stored
      const refreshed = await api.vessel_get()
      if (refreshed?.vessel?.spec) {
        spec.value = refreshed.vessel.spec
        hasImages.value = refreshed.vessel.has_images ?? hasImages.value
        lastUpdated.value = refreshed.vessel.spec.enriched_at
          ? dateFormatUTC(refreshed.vessel.spec.enriched_at)
          : lastUpdated.value
      }

      // Step 4: upload thumbnail if present and no vessel photo yet
      if (spec.value?.thumbnail && !hasImages.value && import.meta.env.VITE_S3_URL) {
        try {
          await uploadThumbnail(api, spec.value.thumbnail)
        } catch (imgErr) {
          console.warn('Thumbnail upload skipped:', imgErr.message)
        }
      }

      apiError.value = null
    } catch (err) {
      apiError.value = err?.message ?? err
    } finally {
      initToast({
        message: apiError.value ? t('boats.boat.spec.error') : t('boats.boat.spec.success'),
        position: 'top-right',
        color: apiError.value ? 'warning' : 'success',
      })
      isBusy.value = false
    }
  }
</script>

<style scoped>
  .my-button {
    width: 100%;
    text-align: center;
  }
</style>
