import PostgSail from '../services/api-client'
export { default as asBusy } from './asBusy'

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function handleGPX(nameInsert: string) {
  const api = new PostgSail()
  try {
    const response = await api[`${nameInsert}_export_gpx` as string]()
    if (response) {
      console.log(`${nameInsert}_export_gpx success`, response)
      const blob = new Blob([response], { type: 'text/xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `PostgSail${capitalize(nameInsert)}.gpx`
      link.click()
    } else {
      throw { response }
    }
  } catch (err: any) {
    const { response } = err
    console.log(`${nameInsert}_export_gpx failed`, err)
    throw response.message
  }
}

export async function handleGeoJSON(nameInsert: string) {
  const api = new PostgSail()
  try {
    const response = await api[`${nameInsert}_export_geojson` as string]()
    if (response) {
      console.log(`${nameInsert}_export_geojson success`, response)
      const blob = new Blob([response], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'PostgSail${capitalize(nameInsert)}.geojson'
      link.click()
    } else {
      throw { response }
    }
  } catch (err: any) {
    const { response } = err
    console.log(`${nameInsert}_export_geojson failed`, err)
    throw response.message
  }
}

export async function handleCSV(items: [Record<string, any>], nameInsert: string) {
  let csv = Object.keys(items[0]) + '\n'
  csv += items
    .map((row) => {
      return Object.values(row).toString()
    })
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `PostgSail${capitalize(nameInsert)}.csv`
  link.click()
}
