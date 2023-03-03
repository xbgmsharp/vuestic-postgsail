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

- [x] Layout
  - [x] Update theme icon to night/day mode theme, like openplotter.cloud
  - [x] Update theme icon to day and night vision
- [ ] Logs:
  - [ ] Add Action '...' column with sub menu to export to CVS, GPX
  - [ ] Add button with icon to export to CVS to log list page
- [ ] Log:
  - [ ] Add trash and save icon to log details page next to text
  - [x] Add button with icon to export to CVS to log details page
  - [x] Add button with icon to export to GPX to log details page
- [ ] Add Profile/Settings page
  - [x] require backend update
- [x] Add new vessel page
  - [x] require backend update
- [x] Add Stays page
  - [x] require backend update
- [ ] Add Moorage page
  - [x] require backend update
- [x] Add Monitoring page
  - [x] require backend update
- [x] Menu icon
  - [x] boats - icon basic sailboat
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
  - [ ] Add external authentification
    - [ ] require backend update
- [ ] Login
  - [x] Create `/activate` page for OTP validation
  - [x] Force email validation via One Time code on login
    - [x] require backend update
- [ ] Singup
  - [x] Create `/activate` page for OTP validation
  - [x] Force email validation via One Time code on Singup
    - [x] require backend update
- [x] Implement notifications Pushover, Telegram
  - [x] require backend update
- [ ] Add Activity page with a timeline of events, history of notifications
  - [ ] require backend update
- [ ] Vessels:
  - [x] Update last_contact text to a human readable string, "Waiting/Pending for vessel connection"
  - [x] Disable boat details page when missing lat_contact null
  - [ ] Add link to https://www.vesselfinder.com/vessels/details/{{MMSI}}
  - [ ] Add link to https://www.marinevesseltraffic.com/2013/06/mmsi-number-search.html?mmsi={{MMSI}}
  - [ ] Add vessel type or even all vessel data
    - [ ] require backend update
- [ ] Add Terms of Use page
- [ ] Update translation
- [ ] Fix English
- [ ] Add telegram bot in the main menu page with QR Code
  - [ ] Account verification
    - [x] require backend update OTP
- [x] Sample data in build
  - [x] include in dev
  - [x] exclude in prod
- [ ] Settings
  - [ ] Update parameters
  - [ ] PushOver Web-Based Subscription Process
    - [ ] Subscription URL format
    - [x] require backend update OTP
  - [ ] Telegram bot subscription process
- [ ] Boats icons base on vessel type
  - [ ] powerboaticon.png vs sailboaticon.png
  - [ ] require backend update
- [ ] Timelapse
  - [x] Log Geojson replay functionality
  - [ ] Generic Geojson replay functionality base on date or multiple logbook
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
  - [x] Widget Total of Logs, Stays, Moorage,
  - [ ] Widget ?!?
  - [ ] Widget Meteo
- [x] /logs/, Logs
  - [x] Table layout from api view, filter and sort
- [x] /log/:id
  - [x] Map layout from api
  - [x] Table layout from api
  - [x] Edit notes and name
  - [x] Link to timelapse
- [ ] /moorages, Moorages
  - [ ] Map layout from api
  - [x] Table layout from api view, filter and sort
- [ ] /moorage/:id
  - [ ] Map layout from api
  - [ ] Table layout from api,
  - [ ] Edit notes and name and Stayed at (select)
- [ ] /stays, stays
  - [x] Table layout from api view, filter and sort
- [ ] /stay/:id
  - [ ] Map layout from api
  - [ ] Table layout from api
  - [ ] Edit notes and name and Stayed at (select)
- [ ] /map, Map
  - [ ] Same as Moorage Map layout from api?
    - [ ] Link to /moorages/map/?
- [x] /boats, Boats
  - [x] Table layout editable?
  - [x] Add geojson we properties and popupcontent
  - [x] Satellite view
- [ ] /timelapse, Timelapse
  - [ ] Map layout from api? todo
- [ ] /stats, Stats/Dashboard
  - [ ] Cards layout
  - [ ] Editable date value range
- [x] /monitoring, Monitoring
  - [x] Steering layout from api? todo
- [ ] /signup, Sign up
  - [ ] Form layout register from api
- [ ] /singin, Sign in
  - [ ] Form layout login from api
- [ ] /settings, User settings
  - [ ] Table & Form layout from api?
- [ ] /faq, FAQ
- [ ] /privacy, Privacy
- [x] /grafana, external link, open a new window/tab
