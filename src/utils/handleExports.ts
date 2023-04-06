import PostgSail from '../services/api-client'
export { default as asBusy } from './asBusy'

export async function handleGPX() {
  console.debug('handleGPX')
  const api = new PostgSail()
  try {
    const response = await api.moorages_export_gpx()
    if (response) {
      console.log('moorages_export_gpx success', response)
      const blob = new Blob([response], { type: 'text/xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'PostgSailMoorages.gpx'
      link.click()
    } else {
      throw { response }
    }
  } catch (err: any) {
    const { response } = err
    console.log('moorages_export_gpx failed', err)
    throw response.message
  }
}

export async function handleGeoJSON() {
  console.debug('handleGeoJSON')
  const api = new PostgSail()
  try {
    const response = await api.moorages_export_geojson()
    if (response) {
      console.log('moorages_export_geojson success', response)
      const blob = new Blob([response], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'PostgSailMoorages.geojson'
      link.click()
    } else {
      throw { response }
    }
  } catch (err: any) {
    const { response } = err
    console.log('moorages_export_geojson failed', err)
    throw response.message
  }
}

export async function handleCSV(items: [Record<string, any>]) {
  console.debug('handleCSV items', items)
  let csv = Object.keys(items[0]) + '\n'
  csv += items
    .map((row) => {
      return Object.values(row).toString()
    })
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'PostgSailMoorages.csv'
  link.click()
}
