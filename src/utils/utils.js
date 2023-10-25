export default {
  // Some utility functions
  fahToCel: function (tempInFahrenheit) {
    if (tempInFahrenheit == null) {
      return null
    }
    var tempInCelsius = Math.round((5 / 9) * (tempInFahrenheit - 32))
    return tempInCelsius
  },
  millibarToKiloPascal: function (pressureInMillibar) {
    var pressureInKPA = pressureInMillibar * 0.1
    return Math.round(pressureInKPA)
  },
  mileToKilometer: function (miles) {
    if (miles == null) {
      return null
    }
    var kilometer = miles * 1.60934
    return Math.round(kilometer * 10) / 10
  },
  mileToKnots: function (miles) {
    if (miles == null) {
      return null
    }
    var knots = miles * 0.8689762
    return Math.round(knots * 10) / 10
  },
  metersToKnots: function (meters) {
    if (meters == null) {
      return null
    }
    var knots = meters * 1.9438445
    return Math.round(knots * 10) / 10
  },
  radiantToDegrees(rad) {
    if (rad == null) {
      return null
    }
    return Math.round(rad * 57.2958 * 10) / 10
  },
  kelvinToCel: function (kelvin) {
    if (kelvin == null) {
      return null
    }
    var tempInCelsius = kelvin - 273.15
    return Math.round(tempInCelsius * 10) / 10
  },
  valToPercent: function (unit) {
    var percentage = unit * 100
    return Math.round(percentage)
  },
  pascalTohPascal: function (pascal) {
    var hpascal = pascal / 100
    return Math.round(hpascal)
  },
  voltage: function (volt) {
    return parseFloat(volt)
  },
  round: function (float) {
    return Math.round(parseFloat(float * 10)) / 10
  },
  deriveWindDir: function (windDir) {
    var wind_directions_array = [
      { minVal: 0, maxVal: 30, direction: 'N' },
      { minVal: 31, maxVal: 45, direction: 'NNE' },
      { minVal: 46, maxVal: 75, direction: 'NE' },
      { minVal: 76, maxVal: 90, direction: 'ENE' },
      { minVal: 91, maxVal: 120, direction: 'E' },
      { minVal: 121, maxVal: 135, direction: 'ESE' },
      { minVal: 136, maxVal: 165, direction: 'SE' },
      { minVal: 166, maxVal: 180, direction: 'SSE' },
      { minVal: 181, maxVal: 210, direction: 'S' },
      { minVal: 211, maxVal: 225, direction: 'SSW' },
      { minVal: 226, maxVal: 255, direction: 'SW' },
      { minVal: 256, maxVal: 270, direction: 'WSW' },
      { minVal: 271, maxVal: 300, direction: 'W' },
      { minVal: 301, maxVal: 315, direction: 'WNW' },
      { minVal: 316, maxVal: 345, direction: 'NW' },
      { minVal: 346, maxVal: 360, direction: 'NNW' },
    ]
    var wind_direction = ''
    for (var i = 0; i < wind_directions_array.length; i++) {
      if (windDir >= wind_directions_array[i].minVal && windDir <= wind_directions_array[i].maxVal) {
        wind_direction = wind_directions_array[i].direction
      }
    }
    return wind_direction
  },
}
