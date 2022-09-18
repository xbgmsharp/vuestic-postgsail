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
         * no vessel
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

  /*
   * Boats API endpoint
   */
  async vessel_reg(payload) {
    return this.API.post(`/rpc/register_vessel`, payload)
  }
  /*
  async vessel_reg(data) {
    const response = await fetch(`${this.app_url}/rpc/register_vessel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: data,
    })
    return await response.json()
  }
*/

  async vessels() {
    return this.API.get(`vessels_view`)
  }

  async vessels_pending() {
    return this.API.get(`vessels_p_view`)
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
}

export default PostgSail
