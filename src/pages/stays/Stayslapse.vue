<template>
  <div class="p-4 relative">
    <!-- Print Button Top Right -->
    <button
      class="fixed top-4 right-4 bg-gray-300 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg print:hidden"
      title="Print Logbook"
      @click="printLogbook"
    >
      🖨️
    </button>
    <!-- notes history -->
    <div id="logbook-entries">
      <h1 class="text-center text-2xl font-bold mb-6">Logbook for {{ vesselName }}</h1>

      <div
        v-for="(entry, index) in noteshistory"
        :key="index"
        class="max-w-3xl mx-auto mb-6 break-inside-avoid print:shadow-none print:border print:rounded-none"
      >
        <va-card class="shadow-md rounded-lg px-6 py-4">
          <va-card-title>
            <div class="flex w-full items-start justify-between gap-4">
              <span class="entry-title text-lg font-semibold text-gray-800 dark:text-white">{{ entry.stay_name }}</span>
              <span class="entry-date text-sm text-gray-500 text-right whitespace-nowrap">{{ entry.arrived }}</span>
            </div>
          </va-card-title>

          <va-card-content>
            <div class="entry-location text-blue-500 text-sm mb-2 flex items-center gap-2">
              <template v-if="entry.stay_code !== 4">
                <img :src="entry.iconUrl" alt="icon" class="inline-block h-4 w-4 print:h-4 print:w-4 align-middle" />
              </template>
              <template v-else> 📍 </template>
              <span>{{ entry.dms }}</span>
            </div>
            <div class="entry-content">
              <p class="text-base text-gray-700 whitespace-pre-line dark:text-white">{{ entry.stay_notes }}</p>
            </div>
            <div v-if="entry.image_url" class="entry-image mt-4">
              <img
                :src="entry.image_url"
                alt="Stay Image"
                class="max-w-full h-auto mx-auto rounded-lg shadow-md print:max-h-[400px]"
              />
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import PostgSail from '../../services/api-client'
  import { dateFormatUTC } from '../../utils/dateFormatter.js'
  import { decimalToDMS } from '../../utils/dms'
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()

  import { useGlobalStore } from '../../stores/global-store'
  import { useVesselStore } from '../../stores/vessel-store'
  import { storeToRefs } from 'pinia'

  const GlobalStore = useGlobalStore()
  const { currentTheme } = storeToRefs(GlobalStore)
  const { vesselName } = useVesselStore()

  const isBusy = ref(null),
    apiError = ref(null),
    apiSuccess = ref(null),
    rowsData = ref([])

  const noteshistory = computed(() => {
    return Array.isArray(rowsData.value)
      ? rowsData.value.map((row) => ({
          stay_id: row.stay_id,
          moorage_id: row.moorage_id,
          stay_name: row.stay_name || 'Active Stay',
          moorage_name: row.stay_name || 'Active Moorage',
          arrived: dateFormatUTC(row.arrived),
          stay_code: row.stay_code,
          dms: decimalToDMS(row.latitude, row.longitude),
          coordinates: [row.longitude, row.latitude],
          stay_notes: row.stay_notes,
          moorage_notes: row.moorage_notes,
          image_url:
            !row.has_image || !row.image_url
              ? null
              : row.image_url.startsWith('http')
              ? row.image_url
              : import.meta.env.VITE_PGSAIL_URL + row.image_url,
          iconUrl:
            row.stay_code === 3 ? '/mooring_icon.png' : row.stay_code === 4 ? '/dock_icon.png' : '/anchoricon.png',
        }))
      : []
  })

  onMounted(async () => {
    isBusy.value = true
    apiError.value = null
    const api = new PostgSail()
    // Notes History
    try {
      const response = await api.notes_history()
      if (Array.isArray(response)) {
        rowsData.value.splice(0, rowsData.value.length || [])
        rowsData.value.push(...response)
        console.log('History list', rowsData.value)
        apiSuccess.value = true
      } else {
        console.warn('History', response)
        //throw { response }
      }
    } catch ({ response }) {
      console.error(response)
    } finally {
      isBusy.value = false
    }
  })

  function printLogbook() {
    const printContents = document.getElementById('logbook-entries').innerHTML
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write(`
    <html>
      <head>
        <title>Printable Logbook</title>
<style>
body {
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
line-height: 1.6;
max-width: 800px;
margin: 0 auto;
padding: 20px;
background: #f5f5f5;
}
.logbook-entry {
background: white;
padding: 20px;
margin-bottom: 20px;
}
.entry-header {
display: flex;
justify-content: space-between;
align-items: flex-start;
margin-bottom: 10px;
}
.entry-title {
font-size: 1.2em;
font-weight: bold;
color: #2c3e50;
margin: 0;
}
.entry-date {
color: #7f8c8d;
font-size: 0.9em;
}
.entry-location {
color: #3498db;
font-size: 0.9em;
margin-bottom: 10px;
}
.entry-content {
margin-top: 15px;
}
.entry-image {
display: flex;
flex-direction: column;
gap: 15px;
margin-top: 15px;
}
.entry-image img {
width: 100%;
height: auto;
max-height: 600px;
object-fit: contain;
border-radius: 8px;
background: #f8f9fa;
}
.entry-type {
display: inline-block;
padding: 3px 8px;
border-radius: 4px;
font-size: 0.8em;
margin-right: 10px;
}
.type-moorage {
background: #e8f5e9;
color: #2e7d32;
}
.type-trackpoint {
background: #e3f2fd;
color: #1565c0;
}
body {
background: white;
padding: 0;
max-width: none;
}
.logbook-entry {
break-inside: avoid;
box-shadow: none;
border: 1px solid #eee;
margin-bottom: 30px;
}
.entry-image img {
max-height: 400px;
}
}
</style>
      </head>
      <body>
        ${printContents}
      </body>
    </html>
  `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
</script>

<style scoped>
  @media print {
    .print\\:hidden {
      display: none !important;
    }
    .break-inside-avoid {
      break-inside: avoid;
    }
  }
</style>
