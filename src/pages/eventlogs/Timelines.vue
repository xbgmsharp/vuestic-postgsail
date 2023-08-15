<template>
  <div class="timelines">
    <div class="grid grid-cols-12">
      <div class="flex col-span-12">
        <va-card no-padding>
          <va-card-title>{{ t('timelines.verticalCentered') }}</va-card-title>
          <va-card-content>
            <va-timeline vertical centered style="min-width: 300px">
              <va-timeline-item v-for="(item, key) in items" :key="key" color="danger" active>
                <template #before>
                  <span class="title title--danger va-timeline-item__text">
                    {{ item.processed }}
                  </span>
                </template>
                <template #after>
                  <va-card stripe stripe-color="success">
                    <va-card-title>{{ item.channel }}</va-card-title>
                  </va-card>
                </template>
              </va-timeline-item>
            </va-timeline>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'

  const { t } = useI18n()

  const isBusy = ref(false)
  const apiError = ref(null)
  const rowsData = ref([])

  const items = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => ({
          id: row['id'],
          processed: dateFormatUTC(row['processed']),
          payload: row['payload'],
          channel: row['channel'],
        }))
      : []
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    try {
      const response = await api.eventlogs()
      console.log('Event Logs', response)
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response.reverse())
        console.log('Event Logs', rowsData.value)
      } else {
        throw { response }
      }
    } catch (e) {
      apiError.value = e
    } finally {
      isBusy.value = false
    }
  })
</script>
