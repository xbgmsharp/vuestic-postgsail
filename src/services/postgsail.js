/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
import axios from 'axios'
import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../stores/global-store'

class PostgSail {
  /*
   * Create PostgSail instance.
   */
  constructor() {
    if (PostgSail.instance) return PostgSail.instance

    this.app_url = import.meta.env.VITE_PGSAIL_URL
    this.token = (this.GlobalStore = useGlobalStore()).token
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
      adapter: fetchAdapter,
    })

    this.check()

    this.API.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        if (error.response) {
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
        }
        throw error
      },
    )

    PostgSail.instance = this
  }

  /*
   * Check API URL.
   */
  check() {
    if (!navigator.onLine || this.app_url == '' || this.app_url == null) {
      console.log('PostgSail: NetworkError when attempting to fetch resource.')
    }
  }

  /*
   * Methods API endpoint
   */

  /*
   * Auth API endpoint
   */
  async login(payload) {
    return this.authAPI.post(`rpc/login`, payload)
  }

  async signin(payload) {
    return this.authAPI.post(`rpc/signup`, payload)
  }

  async recover(payload) {
    return this.authAPI.post(`rpc/recover`, payload)
  }

  async reset(payload) {
    return this.authAPI.post(`rpc/reset`, payload)
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
  async otp_generate(payload) {
    return this.API.post(`rpc/generate_otp_fn`, payload)
  }
  async otp_email(payload) {
    return this.API.post(`rpc/email_fn`, payload)
  }
  async pushover(payload) {
    return this.API.post(`rpc/pushover_fn`, payload)
  }
  async pushover_link() {
    return this.API.post(`rpc/pushover_subscribe_link_fn`)
  }

  /*
   * Vessels API endpoint
   */
  async vessel_reg(payload) {
    return this.API.post(`/rpc/register_vessel`, payload)
  }

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

  async log_export_gpx(payload) {
    return this.API.post(`rpc/export_logbook_gpx_fn`, payload)
  }

  async log_export_geojson(payload) {
    return this.API.post(`rpc/export_logbook_geojson_fn`, payload)
  }

  async log_export_geojson_point_fn(payload) {
    return this.API.post(`rpc/export_logbook_geojson_point_fn`, payload)
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
  async monitoring() {
    return this.API.get(`monitoring_view`)
  }

  /*
   * Stays at
   */
  async stays_at() {
    return this.API.get(`stays_at`)
  }

  /*
   * Charts API endpoint
   */
  async total_info() {
    return this.API.get(`total_info_view`)
  }
  async logs_by_month() {
    return this.API.get(`rpc/logs_by_month_fn`)
  }
  async logs_by_year() {
    return this.API.get(`rpc/logs_by_month_fn`)
  }

  /*
   * Stats API endpoint
   */
  async stats_logs_view() {
    return this.API.get(`stats_logs_view`)
  }
  async stats_moorages_view() {
    return this.API.get(`stats_moorages_view`)
  }
}

export default PostgSail
