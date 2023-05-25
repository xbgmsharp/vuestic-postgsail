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
- [x] Logs:
  - [x] Add Action '...' column with sub menu to export to CSV, GPX
  - [x] Add button with icon to export to CSV to log list page
- [ ] Log:
  - [ ] Add trash and save icon to log details page next to text
  - [x] Add button with icon to export to CVS to log details page
  - [x] Add button with icon to export to GPX to log details page
- [x] Add Profile/Settings page
  - [x] require backend update
- [x] Add new vessel page
  - [x] require backend update
- [x] Add Stays page
  - [x] require backend update
- [ ] Add Moorages page
  - [x] require backend update
- [x] Add Map page
  - [x] require backend update
- [x] Add Monitoring page
  - [x] require backend update
- [x] Menu icon
  - [x] boats - icon basic sailboat
  - [x] moorages - icon anchor
  - [x] stays - icon alone
  - [x] logs - icon logbook
  - [ ] privacy -
  - [ ] faq -
  - [x] monitoring -
  - [x] observability - icon grafana
  - [x] badges - icon
  - [x] map - icon
- [ ] Security
  - [ ] Implement refresh token
    - [ ] require backend update
  - [ ] Add external authentication
    - [ ] require backend update
- [ ] Login
  - [x] Create `/activate` page for OTP validation
  - [x] Force email validation via One Time code on login
    - [x] require backend update
- [ ] Singup
  - [x] Create `/activate` page for OTP validation
  - [x] Force email validation via One Time code on Signup
    - [x] require backend update
- [x] Implement notifications Pushover, Telegram
  - [x] require backend update
- [ ] Add Activity page with a timeline of events, history of notifications
  - [ ] require backend update
- [ ] Vessels:
  - [x] Update last_contact text to a human readable string, "Waiting/Pending for vessel connection"
  - [x] Disable boat details page when missing lat_contact null
  - [x] Add link to https://www.vesselfinder.com/vessels/details/{{MMSI}}
  - [x] Add link to https://www.marinevesseltraffic.com/2013/06/mmsi-number-search.html?mmsi={{MMSI}}
  - [ ] Add vessel type or even all vessel metadata
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
  - [x] PushOver Web-Based Subscription Process
    - [x] Subscription URL format
    - [x] require backend update OTP
  - [x] Telegram bot link
- [ ] Boats icons base on vessel type
  - [ ] powerboaticon.png vs sailboaticon.png
  - [ ] require backend update
- [ ] Timelapse
  - [x] Log Geojson replay functionality
  - [x] Generic Geojson replay functionality base on date or multiple logbook
  - [x] require backend update
- [ ] Loading screen
  - [ ] Based on variable isLoading from store
  - [ ] Display an animated gif while loading content, like in app.bromera.eu
  - [x] page loadingScreen

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
- [x] /moorages, Moorages
  - [x] Map layout from api
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
- [x] /map, Map
  - [x] Same as Moorage Map layout from api
    - [x] Link to /moorages/map/
- [x] /boats, Boats
  - [x] Table layout editable?
  - [x] Add geojson we properties and popupcontent
  - [x] Satellite view
- [x] /timelapse, Timelapse
  - [x] Map layout from api
- [ ] /stats, Stats/Dashboard
  - [ ] Cards layout
  - [ ] Editable date value range
- [x] /monitoring, Monitoring
  - [x] Steering layout from api? todo
- [x] /signup, Sign up
  - [x] Form layout register from api
- [x] /signin, Sign in
  - [x] Form layout login from api
- [x] /settings, User settings
  - [x] Table & Form layout from api
- [ ] /badges, User badges
  - [ ] Table from api
- [ ] /faq, FAQ
- [ ] /privacy, Privacy
- [x] /grafana, external link, open a new window/tab

## Dependencies

- [x] Remove axios dependency in favor of nodejs fetch
- [ ] Update to the latest vestion vuestic-ui and tailwindcss (css issue on pofile page)
- [ ] Update to the latest vestion chart.js and vue-chart.js
- [ ] Update to the latest vestion vue-i18n
- [ ] Update to the latest vestion vitejs and plugins
- [x] Remove medium-editor dependency
- [x] Remove amcharts dependency
- [ ] Remove date-fns dependency

## Icons/SVG

- https://fonts.google.com/icons?icon.set=Material+Icons
- https://www.svgrepo.com/

## Debugger

- JSON Web Tokens, https://jwt.io/
- GeoJSON, https://geojson.io/
- Nominatim, https://nominatim.openstreetmap.org/ui/reverse.html
- GPX validation, https://opencpn.org/OpenCPN/info/gpxvalidation.html
