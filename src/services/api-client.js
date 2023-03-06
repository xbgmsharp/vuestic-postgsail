/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
import HttpClient from './HttpClient'
import { useGlobalStore } from '../stores/global-store'

class ApiClient extends HttpClient {
  /*
   * Create ApiClient instance.
   */
  constructor() {
    if (ApiClient.instance) return ApiClient.instance

    super({
      baseURL: import.meta.env.VITE_PGSAIL_URL + '/',
      headers: { Test: 'qwerty', Accept: 'application/json', 'Content-Type': 'application/json' },
    })
    // Assing Bearer Token if exist in cache
    if (useGlobalStore().token) {
      this.setBearerAuth(useGlobalStore().token)
    }
    // Check online status
    this.check()

    ApiClient.instance = this
  }

  /*
   * Check API URL.
   */
  check() {
    if (!navigator.onLine || this._baseURL == '/' || this._baseURL == null) {
      console.warn('PostgSail: NetworkError when attempting to fetch resource.')
    }
  }

  /*
   * Methods API endpoint
   */

  /*
   * Auth API endpoint
   */
  async login(payload) {
    return this.post(`rpc/login`, payload)
  }

  async signin(payload) {
    return this.post(`rpc/signup`, payload)
  }

  async recover(payload) {
    return this.post(`rpc/recover`, payload)
  }

  async reset(payload) {
    return this.post(`rpc/reset`, payload)
  }
  /*
   * User settings
   */
  async settings() {
    return this.get(`rpc/settings_fn`)
  }
  async update_user_preferences(payload) {
    return this.post(`rpc/update_user_preferences_fn`, payload)
  }
  async versions() {
    return this.get(`rpc/versions_fn`)
  }
  async otp_generate(payload) {
    return this.post(`rpc/generate_otp_fn`, payload)
  }
  async otp_email(payload) {
    return this.post(`rpc/email_fn`, payload)
  }
  async pushover(payload) {
    return this.post(`rpc/pushover_fn`, payload)
  }
  async pushover_link() {
    return this.post(`rpc/pushover_subscribe_link_fn`)
  }

  /*
   * Vessels API endpoint
   */
  async vessel_reg(payload) {
    return this.post(`/rpc/register_vessel`, payload)
  }

  async vessels() {
    return this.get(`vessels_view`)
  }

  async vessels_pending() {
    return this.get(`vessel_p_view`)
  }

  async vessel_get() {
    return this.get(`rpc/vessel_fn`)
  }

  async vessel_get_token(data) {
    return this.vessel_reg(data)
  }

  /*
   * Logs API endpoint
   */
  async logs() {
    return this.get(`logs_view`)
  }

  async log_get(id) {
    return this.get(`log_view?id=eq.${id}`)
  }

  async log_update(id, payload) {
    return this.patch(`logbook?id=eq.${id}`, payload)
  }

  async log_delete(id) {
    return this.delete(`logbook?id=eq.${id}`)
  }

  async log_export_gpx(payload) {
    return this.post(`rpc/export_logbook_gpx_fn`, payload)
  }

  async log_export_geojson(payload) {
    return this.post(`rpc/export_logbook_geojson_fn`, payload)
  }

  async log_export_geojson_point_fn(payload) {
    return this.post(`rpc/export_logbook_geojson_point_fn`, payload)
  }

  /*
   * Moorages API endpoint
   */
  async moorages() {
    return this.get(`moorages_view`)
  }

  async moorage_get(id) {
    return this.get(`moorage_view?id=eq.${id}`)
  }

  async moorage_update(id, payload) {
    return this.patch(`moorages?id=eq.${id}`, payload)
  }

  async moorage_delete(id) {
    return this.delete(`moorages?id=eq.${id}`)
  }

  /*
   * Stays API endpoint
   */
  async stays() {
    return this.get(`stays_view`)
  }

  async stay_get(id) {
    return this.get(`stay_view?id=eq.${id}`)
  }

  async stay_update(id, payload) {
    return this.patch(`stays?id=eq.${id}`, payload)
  }

  async stay_delete(id) {
    return this.delete(`stays?id=eq.${id}`)
  }

  /*
   * Monitoring API endpoint
   */
  async monitoring() {
    return this.get(`monitoring_view`)
  }

  /*
   * Stays at
   */
  async stays_at() {
    return this.get(`stays_at`)
  }

  /*
   * Charts API endpoint
   */
  async total_info() {
    return this.get(`total_info_view`)
  }
  async logs_by_month() {
    return this.get(`rpc/logs_by_month_fn`)
  }
  async logs_by_year() {
    return this.get(`rpc/logs_by_month_fn`)
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

  /*
   * Logs
   *
   * */
  get log() {
    return {
      all: () => this.get(`logs_view`),
      get: (id) => this.get(`log_view?id=eq.${id}`),
      delete: (id) => this.delete(`log_view?id=eq.${id}`),
      update: (id, payload) => this.API.patch(`logbook?id=eq.${id}`, payload),
    }
  }

  /*
   * Stays
   *
   * */
  get stay() {
    return {
      all: () => this.get(`stays_view`),
      get: (id) => this.get(`stay_view?id=eq.${id}`),
      delete: (id) => this.delete(`stay_view?id=eq.${id}`),
      update: (id, payload) => this.checkpatch(`stays?id=eq.${id}`, payload),
    }
  }

  /*
   * Moorages
   *
   * */
  get moorage() {
    return {
      all: () => this.get(`moorages_view`),
      get: (id) => this.get(`moorage_view?id=eq.${id}`),
      delete: (id) => this.delete(`moorage_view?id=eq.${id}`),
      update: (id, payload) => this.patch(`moorages?id=eq.${id}`, payload),
    }
  }
}

export default ApiClient