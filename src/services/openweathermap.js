/*
 * Service that fetch and parse weather forecast from openweathermap.org.
 *
 */
class WeatherForecast {
  /*
   * Create WeatherForecast instance.
   */
  constructor() {
    this.appid = import.meta.env.VITE_OPENWEATHERMAP_APIKEY || null
    this.data = null

    this.check_appid()
  }

  /*
   * Check appid key.
   */
  check_appid() {
    if (this.appid == '' || this.appid == null) {
      console.warn(`OpenWeathermap, appid provided.`)
      this.data = {
        error: `OpenWeathermap, appid provided.`,
      }
      return false
    }
    return true
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

    if (!this.check_appid()) {
      return
    }

    try {
      data = await this.getForecast(coordinates)
    } catch (e) {
      console.log('OpenWeathermap:' + e)
      data = this.getErrorData()
    }

    this.populate(data)
  }

  /*
   * Fetch weather forecast from endpoint(openweathermap.org).
   *
   * @param {Object} coordinates - Lat & Lon coordinates object.
   */
  async getForecast(coordinates) {
    let appid = this.appid

    //let endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${appid}&units=metric`;
    let endpoint = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.latitude}&lon=${coordinates.longitude}&appid=${appid}&units=metric&exclude=minutely`
    let response = await fetch(endpoint)

    return await response.json()
  }

  /*
   * Error data for end-users.
   */
  getErrorData() {
    return {
      error: `There's a problem at the weather forecast server ¯\\_(ツ)_/¯`,
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

export default WeatherForecast
