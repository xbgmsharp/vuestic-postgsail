import i18n from '../i18n/index.ts'
import useGlobalStore from '../stores/global-store'
const { t } = i18n.global,
  GlobalStore = useGlobalStore()

export const distanceLatLng = (val, trad = 'units.distance.miles') => {
  if (!val) return null
  const n = kmToMiles(parseFloat(val / 1000)) // meters -> km -> NM
  console.log('distanceLatLng', n.toFixed(3))
  return t(trad, n)
}

export const distanceFormatMiles = (val, trad = 'units.distance.miles') => {
  if (!val) return null
  //const n = GlobalStore.imperialUnits ? parseFloat(val) : ((trad = 'units.distance.kilometres'), milesToKm(val))
  const n = parseFloat(val)
  const count = { n: n % 1 ? parseFloat(n.toFixed(1)) : n }
  return t(trad, count)
}

export function distanceFormat(val) {
  return parseFloat(val).toFixed(1)
}

export function distanceKm(val, trad = 'units.distance.kilometres') {
  if (!val) return null
  //const n = GlobalStore.imperialUnits ? ((trad = 'units.distance.miles'), kmToMiles(val)) : parseFloat(val)
  const n = parseFloat(val)
  const count = { n: Number.isInteger(n) ? n : parseFloat(n.toFixed(1)) }
  return t(trad, count)
}

export function distanceMetres(val) {
  return distanceKm(val / 1000)
}

export function milesToKm(val) {
  return parseFloat(val) * 1.852
}
export function kmToMiles(val) {
  return parseFloat(val) * 0.539957
}
