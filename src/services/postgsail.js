/*
 * Service that fetch and parse data from PostgSail API.
 *
 */
class PostgSail {
  /*
   * Create PostgSail instance.
   */
  constructor() {
    this.app_url = import.meta.env.VITE_PGSAIL_URL || null
    this.data = null
    this.status = null
    this.token = null

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

  async login(data) {
    const response = await fetch(`${this.app_url}/rpc/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: data,
    })
    return await response.json()
  }

  async signin(data) {
    const response = await fetch(`${this.app_url}/rpc/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: data,
    })
    return await response.json()
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
    const response = await fetch(`${this.app_url}/vessel`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    })
    return await response.json()
  }

  async logs() {
    const response = await fetch(`${this.app_url}/logs_view`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    })
    return await response.json()
  }

  async log_get(id) {
    const response = await fetch(`${this.app_url}/log_view?id=eq.${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    })
    return await response.json()
  }

  async log_update(id, data) {
    const response = await fetch(`${this.app_url}/log_view?id=eq.${id}`, {
      method: 'PATH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: data,
    })
    return await response.json()
  }
}

export default PostgSail
