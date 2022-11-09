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
  - [ ] Implement global store username, token, cache: logs, moorages, stays
    - [ ] Implement offline mode
- [ ] Logs:
  - [ ] Add Action '...' column with sub menu to export to CVS, GPX or trash
  - [ ] Add button with icon to export to CVS to log list page
  - [ ] Add button with to export to GPX to log details page
  - [ ] Add trash and save icon to log details page
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
  - [ ] moorage - icon anchor
  - [ ] stays - icon alone
  - [ ] logs - icon logbook
  - [ ] privacy -
  - [ ] faq -
  - [ ] monitoring -
- [ ] Security
  - [ ] Implement refresh token
    - [ ] require backend update
  - [ ] Add Auth0 authentification
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
  - [ ] Disable vessel details link if missing or null last_contact
  - [ ] Disable boat details page when missing lat_contact null
- [ ] Add Terms of Use page
- [ ] Update translation
- [ ] Fix English
- [ ] Add telegram bot in the main menu page with QR Code
  - [ ] Account verification
    - [x] require backend update OTP
- [ ] Toggle demo data on build
  - [ ] include in dev
  - [ ] exclude in prod
- [ ] Settings
  - [ ] PushOver Web-Based Subscription Process
    - [x] require backend update OTP
- [ ] Boats icons base on type
  - [ ] powerboaticon.png vs sailboaticon.png

#### Core

- [ ] Use vuejs/pinia store to access API instead of by compoments
  - [ ] Offline mode store all data in browser local storage
    - [ ] Refresh to API is data is older than 1h

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
