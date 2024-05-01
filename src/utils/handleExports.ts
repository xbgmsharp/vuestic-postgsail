import PostgSail from '../services/api-client'
export { default as asBusy } from './asBusy'
import type { JSObj } from '../data/types'

const formatMap: JSObj = {
  //= { <format>: [<function>, <mimetype>],.. }
  gpx: [callAPI, 'application/gpx+xml'],
  geojson: [callAPI, 'application/geo+json'],
  csv: [createCSV, 'text/csv'],
  kml: [callAPI, 'application/vnd.google-earth.kml+xml'],
}

export async function handleExport(
  format = 'gpx',
  apiPrefix: string,
  payload: undefined | JSObj,
  filePrefix: string = apiPrefix,
) {
  //console.log(format)
  const endpoint = `${apiPrefix}_export_${format}`
  try {
    const response = await formatMap[format][0](endpoint, payload)
    if (!response) throw { response }

    //console.log(`${endpoint} success`, response)
    downloadFile(response, formatMap[format][1], `PostgSail_${capitalize(filePrefix)}.${format}`)
  } catch (err: any) {
    const { response } = err
    console.log(`${endpoint} failed`, err)
    throw response.message
  }
}

/*
 * Some reason out of my knowledge, in the logbook sidebar export just send different parameters
 */
export async function handleExportNew(
  format = 'gpx',
  apiPrefix: string,
  payload: undefined | JSObj,
  filePrefix: string = apiPrefix,
) {
  //console.log(format)
  // db: export_logbook_gpx {"_id":6658}
  // Api log_export_gpx {"_id":6658}
  //const endpoint = `${apiPrefix}_export_${format}`
  const endpoint = `${format[1]}_export_${format[0]}`
  //console.log(endpoint)
  //console.log(`${format[1]}_export_${format[0]}`)

  try {
    //console.log(formatMap[format[0]][0])
    //const response = await formatMap[format][0](endpoint, payload)
    const response = await formatMap[format[0]][0](endpoint, format[2])

    if (!response) throw { response }

    //console.log(`${endpoint} success`, response)
    downloadFile(response, formatMap[format[0]][1], `PostgSail_${capitalize(format[3])}.${format[0]}`)
  } catch (err: any) {
    const { response } = err
    console.log(`${endpoint} failed`, err)
    throw response.message
  }
}

export async function callAPI(endpoint: string, payload: JSObj) {
  //console.debug('handleExports callAPI endpoint', endpoint)
  //return JSON.stringify(await new PostgSail()[endpoint](payload))
  const data = await new PostgSail()[endpoint](payload)
  if (data.geojson) {
    return JSON.stringify(data.geojson)
  }
  return data
}

export function createCSV(endpoint: string, items: JSObj) {
  return (
    Object.keys(items[0]) +
    '\n' +
    items
      .map((row: JSObj) => {
        return Object.values(row).toString()
      })
      .join('\n')
  )
}

export function downloadFile(data: JSObj, mime: string, name: string) {
  const blob = new Blob([data as BlobPart], { type: mime })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
