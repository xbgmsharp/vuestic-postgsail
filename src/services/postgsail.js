/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
import axios from 'axios'
import { useRouter } from 'vue-router'

class PostgSail {
  /*
   * Create PostgSail instance.
   */
  constructor() {
    this.app_url = import.meta.env.VITE_PGSAIL_URL
    this.token = localStorage.getItem('token')
    this.router = useRouter()
    this.authAPI = axios.create({
      baseURL: this.app_url + '/',
    })

    this.API = axios.create({
      baseURL: this.app_url + '/',
      headers: {
        Authorization: 'Bearer ' + this.token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    this.check()

    this.API.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response.status === 401) {
          this.router.push({ name: 'logout', params: { is401: true } })
        }
        /* Default return HTTP/400
         * no vessel returns
         * "unrecognized configuration parameter \"vessel.mmsi\""
         * updated backend to return HTTP/551
         * {"hint":"Unkown vessel","details":"Invalid vessel"}
         */
        if (error.response.status === 551) {
          this.router.push({ name: 'boat-new' })
        }
        throw error
      },
    )
  }

  /*
   * Check API URL.
   */
  check() {
    if (!navigator.onLine || this.app_url == '' || this.app_url == null) {
      console.log(`PostgSail, NetworkError when attempting to fetch resource.`)
    }
  }

  /*
   * Methods API endpoint
   */

  /*
   * Auth API endpoint
   */
  login(payload) {
    return this.authAPI.post(`rpc/login`, payload)
  }

  async signin(payload) {
    return this.authAPI.post(`rpc/signup`, payload)
  }

  /*
   * User settings
   */
  async settings() {
    return this.API.get(`rpc/settings_fn`)
  }
  async update_user_preferences(payload) {
    return this.API.post(`rpc/update_user_preferences_fn`, payload)
  }
  async versions() {
    return this.API.get(`rpc/versions_fn`)
  }
  async otp(payload) {
    return this.API.post(`rpc/generate_otp_fn`, payload)
  }
  async pushover(payload) {
    return this.API.post(`rpc/pushover_fn`, payload)
  }

  /*
   * Boats API endpoint
   */
  async vessel_reg(payload) {
    return this.API.post(`/rpc/register_vessel`, payload)
  }

  /*
   * Vssels API endpoint
   */
  async vessels() {
    return this.API.get(`vessels_view`)
  }

  async vessels_pending() {
    return this.API.get(`vessel_p_view`)
  }

  async vessel_get() {
    return this.API.get(`rpc/vessel_fn`)
  }

  async vessel_get_token(data) {
    return this.vessel_reg(data)
  }

  /*
   * Logs API endpoint
   */
  async logs() {
    return this.API.get(`logs_view`)
  }

  async log_get(id) {
    return this.API.get(`log_view?id=eq.${id}`)
  }

  async log_update(id, payload) {
    return this.API.patch(`logbook?id=eq.${id}`, payload)
  }

  async log_delete(id) {
    return this.API.delete(`logbook?id=eq.${id}`)
  }

  /*
   * Moorages API endpoint
   */
  async moorages() {
    return this.API.get(`moorages_view`)
  }

  async moorage_get(id) {
    return this.API.get(`moorage_view?id=eq.${id}`)
  }

  async moorage_update(id, payload) {
    return this.API.patch(`moorages?id=eq.${id}`, payload)
  }

  async moorage_delete(id) {
    return this.API.delete(`moorages?id=eq.${id}`)
  }

  /*
   * Stays API endpoint
   */
  async stays() {
    return this.API.get(`stays_view`)
  }

  async stay_get(id) {
    return this.API.get(`stay_view?id=eq.${id}`)
  }

  async stay_update(id, payload) {
    return this.API.patch(`stays?id=eq.${id}`, payload)
  }

  async stay_delete(id) {
    return this.API.delete(`stays?id=eq.${id}`)
  }

  /*
   * Monitoring API endpoint
   */
}

export default PostgSail
