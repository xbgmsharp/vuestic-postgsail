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

    this.check()
  }

  /*
   * Check API KEY.
   */
  check() {
    /*
        if (navigator.onLine && (this.appid !== '' && this.appid !== null)) {
            this.doitPhotos();
        }
        */
    if (!navigator.onLine || this.app_url == '' || this.app_url == null) {
      console.log(`PostgSail, NetworkError when attempting to fetch resource.`)
    }
  }

  /*
   * Prepare Get photos
   */
  async doitPhotos() {
    let data = null

    try {
      data = await this.getPhotos()
    } catch (e) {
      console.log('Unsplash:' + e)
      data = this.getErrorData()
    }

    this.populate(data)
  }

  /*
   * Fetch photos from endpoint(api.unsplash.com).
   */
  async getPhotos() {
    let appid = this.appid
    let keywords = this.searchKeywords
    // To get random keyboard during search whne user opens the page
    let query = keywords[Math.floor(Math.random() * keywords.length)]
    let endpoint = `https://api.unsplash.com/search/photos?page=1&per_page=10&query=${query}&client_id=${appid}`

    let response = await fetch(endpoint)
    return await response.json()
  }

  /*
   * Error data for end-users.
   */
  getErrorData() {
    return {
      error: `There's a problem fetching data`,
    }
  }

  /*
   * TODO
   */

  async login(data) {
    const response = await fetch(`${this.app_url}/rpc/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ user: data }),
    })
    return await response.json()
  }

  async signin(data) {
    const response = await fetch(`${this.app_url}/rpc/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ user: data }),
    })
    return await response.json()
  }

  async vessel(data) {
    const response = await fetch(`${this.app_url}/rpc/register_vessel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ user: data }),
    })
    return await response.json()
  }

  async logs_view(data) {
    const response = await fetch(`${this.app_url}/rpc/logs_view`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    })
    return await response.json()
  }
}

export default PostgSail
