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
  - [ ] Add button with icon to export to CVS to log list page
  - [ ] Add button with to export to GPX to log details page
  - [ ] Add trash and save icon to log details page
- [ ] Add Profile page
  - [ ] require backend update
- [ ] Add new vessel page
  - [ ] require backend update
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
  - [ ] monitoring
- [ ] Security
  - [ ] Implement refresh token
    - [ ] require backend update
  - [ ] Add Auth0 authentification
- [ ] Singup
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
- [ ] Update translation

### In Progress

- [ ] In Progress

### Done ✓

- [x] Done
