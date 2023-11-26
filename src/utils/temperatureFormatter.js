import useGlobalStore from '../stores/global-store'
const GlobalStore = useGlobalStore()

export const kelvinToCelsius = (deg) => {
  if (deg == null) {
    return null
  }
  return Math.round((deg - 273.15) * 10) / 10
}

export const kelvinToFahrenheit = (deg) => {
  if (deg == null) {
    return null
  }
  return Math.round((deg - 273.15) * 9) / 5 + 32
}

export const kelvinToHuman = (deg) => {
  if (deg == null) {
    return null
  }
  //console.log('imperialUnits', GlobalStore.imperialUnits)
  return GlobalStore.imperialUnits ? kelvinToFahrenheit(deg) : kelvinToCelsius(deg)
}
