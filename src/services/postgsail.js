/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
import axios from 'axios'
class PostgSail {
  /*
   * Create PostgSail instance.
   */
  constructor() {
    this.app_url = import.meta.env.VITE_PGSAIL_URL || null
    this.data = null
    this.status = null
    this.token = localStorage.getItem('token')

    this.check()
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

  login(payload) {
    return axios.post(`${this.app_url}/rpc/login`, payload)
  }

  async signin(payload) {
    return axios.post(`${this.app_url}/rpc/signin`, payload)
  }

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

  async vessel_get() {
    return axios.get(`${this.app_url}/vessel`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  async vessel_get_token() {
    return axios.get(`${this.app_url}/vessel_token`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  async logs() {
    return axios.get(`${this.app_url}/logs_view`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  async log_get(id) {
    return axios.get(`${this.app_url}/log_view?id=eq.${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    })
  }

  async log_update(id, payload) {
    return axios.put(`${this.app_url}/log_view?id=eq.${id}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: payload,
    })
  }
}

export default PostgSail
