[PostgSail](https://github.com/xbgmsharp/postgsail) frontend in VueJs with vuestic-ui.

Based on [vuestic-admin](https://vuestic.dev)

### Setup

```bash
# npm install
```

```bash
# cp .env.example .env
```

```bash
# nano .env
```

```bash
# npm run dev -- --host 0.0.0.0 --port 8080
```

```bash
# npm run build
```

### Todo

- [ ] Layout
  - [ ] Update theme icon to night/day mode theme, like openplotter.cloud
  - [ ] Update theme icon to day and night vision
- [ ] Logs:
  - [ ] Add Action '...' column with sub menu to export to CVS, GPX
  - [ ] Add button with icon to export to CVS to log list page
  - [ ] Add button with to export to GPX to log details page
- [ ] Log:
  - [ ] Add trash and save icon to log details page next to text
- [ ] Add Profile/Settings page
  - [ ] require backend update
- [x] Add new vessel page
  - [x] require backend update
- [ ] Add Stays page
  - [ ] require backend update
- [ ] Add Moorage page
  - [ ] require backend update
- [ ] Add Monitoring page
  - [ ] require backend update
- [ ] Menu icon png? svg?
  - [ ] boats - icon basic sailboat
  - [ ] moorages - icon anchor
  - [ ] stays - icon alone
  - [ ] logs - icon logbook
  - [ ] privacy -
  - [ ] faq -
  - [ ] monitoring -
  - [ ] observability - icon grafana
- [ ] Security
  - [ ] Implement refresh token
    - [ ] require backend update
  - [ ] Add Auth0 authentification
    - [ ] require backend update
- [ ] Singup
  - [ ] Create `/activate` page for OTP validation via QS?
  - [ ] Force email validation via One Time code
    - [ ] require backend update
- [ ] Implement notifications
  - [ ] require backend update
- [ ] Add Activity page with a timeline of events, history of notifications?
  - [ ] require backend update
- [ ] Vessels:
  - [ ] Update last_contact text to a human readable string, "Waiting/Pending for vessel connection"
  - [ ] Disable boat details page when missing lat_contact null
  - [ ] Add link to https://www.vesselfinder.com/vessels/details/{{MMSI}}
  - [ ] Add link to https://www.marinevesseltraffic.com/2013/06/mmsi-number-search.html?mmsi={{MMSI}}
  - [ ] Add vessel type or even all vessel data?
    - [ ] require backend update
- [ ] Add Terms of Use page
- [ ] Update translation
- [ ] Fix English
- [ ] Add telegram bot in the main menu page with QR Code
  - [ ] Account verification
    - [x] require backend update OTP
- [x] Toggle sample data on build
  - [x] include in dev
  - [x] exclude in prod
- [ ] Settings
  - [ ] PushOver Web-Based Subscription Process
    - [ ] Subscription URL format
    - [x] require backend update OTP

```
"https://pushover.net/subscribe/PostgSail-23uvrho1d5y6n3e"
+ "?success=" + urlencode("https://beta.openplotter.cloud/api/rpc/pushover_fn?token=" + generate_otp_fn({{email}}))
+ "&failure=" + urlencode("https://beta.openplotter.cloud/settings");
```

- [ ] Boats icons base on vessel type
  - [ ] powerboaticon.png vs sailboaticon.png
  - [ ] require backend update
- [ ] Timelapse
  - [ ] Geojson replay functionality
- [ ] Loading screen
  - [ ] Based on variable isLoading from store
  - [ ] Display an animated gif while loading content, like in app.bromera.eu

#### Core

- [ ] Use vuejs/pinia store to access API instead of by compoments
  - [ ] Offline mode store all API data in browser local storage
    - [ ] Refresh if data is older than 10min old
    - [ ] Fallback to localstorage is no internet
  - [ ] Implement global store username, token, cache: logs, moorages, stays
    - [ ] Implement offline mode

#### Pages:

- [ ] /, Home, Dashboard
  - [ ] Widget - Current Boats position map
  - [ ] Widget Total of logs
  - [ ] Widget Total Stays, Moorage,
  - [ ] Widget Meteo
- [ ] /logs/, Logs
  - [ ] Table layout from api view, filter and sort
- [ ] /log/:id
  - [ ] Map layout from api
  - [ ] Table layout from api
  - [ ] Edit notes and name
- [ ] /moorages, Moorages
  - [ ] Map layout from api
  - [ ] Table layout from api view, filter and sort
- [ ] /moorage/:id
  - [ ] Map layout from api
  - [ ] Table layout from api,
  - [ ] Edit notes and name and Stayed at (select)
- [ ] /stays, stays
  - [ ] Table layout from api view, filter and sort
- [ ] /stay/:id
  - [ ] Map layout from api
  - [ ] Table layout from api
  - [ ] Edit notes and name and Stayed at (select)
- [ ] /map, Map
  - [ ] Same as Moorage Map layout from api?
    - [ ] Link to /moorages/map/?
- [ ] /boats, Boats
  - [ ] Table layout editable?
  - [ ] Add geojson we properties and popupcontent
  - [ ] Satellite view
- [ ] /timelapse, Timelapse
  - [ ] Map layout from api? todo
- [ ] /stats, Stats/Dashboard
  - [ ] Cards layout
  - [ ] Editable date value range
- [ ] /monitoring, Monitoring
  - [ ] Steering layout from api? todo
- [ ] /signup, Sign up
  - [ ] Form layout register from api
- [ ] /singin, Sign in
  - [ ] Form layout login from api
- [ ] /settings, User settings
  - [ ] Table & Form layout from api?
- [ ] /faq, FAQ
- [ ] /privacy, Privacy
- [ ] /grafana, external link, open a new window/tab
