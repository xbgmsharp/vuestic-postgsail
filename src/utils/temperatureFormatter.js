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
