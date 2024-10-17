/*
 * Service that fetch and parse weather forecast from open-meteo.com.
 *
 */
class OpenMeteo {
  /*
   * Create WeatherForecast instance.
   */
  constructor() {
    this.data = null
  }

  /*
   * Update forecast from given coordinates data.
   *
   * @param {Object} position - Lat & lon coordinates object.
   */
  async updateForecast([latitude, longitude]) {
    let data = null
    let coordinates = {}
    coordinates.latitude = latitude
    coordinates.longitude = longitude

    try {
      data = await this.getForecast(coordinates)
    } catch (e) {
      console.log('OpenMeteo:' + e)
      data = this.getErrorData()
    }

    this.populate(data)
  }

  /*
   * Fetch weather forecast from endpoint(open-meteo.com).
   *
   * @param {Object} coordinates - Lat & Lon coordinates object.
   */
  async getForecast(coordinates) {
    let endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timeformat=unixtime&forecast_days=1`
    let response = await fetch(endpoint)

    return await response.json()
  }

  /*
   * Error data for end-users.
   */
  getErrorData() {
    return {
      error: `There's a problem at the open-meteo server ¯\\_(ツ)_/¯`,
    }
  }

  /*
   * Set new data.
   *
   * @param {Object} data - Weather forecast json data.
   */
  populate(data) {
    this.data = data
  }
}

export default OpenMeteo
