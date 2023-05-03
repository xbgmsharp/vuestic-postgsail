import i18n from '../i18n/index.ts'
import useGlobalStore from '../stores/global-store'
const { t } = i18n.global,
  GlobalStore = useGlobalStore()

export const distanceFormat = (val, trad = 'units.distance.miles') => {
  if (!val) return null
  const n = GlobalStore.imperialUnits ? parseFloat(val) : ((trad = 'units.distance.kilometres'), milesToKm(val))
  const count = { n: n % 1 ? parseFloat(n.toFixed(2)) : n }
  return t(trad, count)
}

export function distanceKm(val, trad = 'units.distance.kilometres') {
  if (!val) return null
  const n = GlobalStore.imperialUnits ? ((trad = 'units.distance.miles'), kmToMiles(val)) : parseFloat(val)
  const count = { n: n % 1 ? parseFloat(n.toFixed(2)) : n }
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
