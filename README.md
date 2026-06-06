# Friend Reminder

Friend Reminder is a privacy-first Expo + React Native + TypeScript MVP for manually tracking relationship cadence, interaction history, and local reminders.

## Install

```sh
npm install
```

The project uses Expo SDK 56 with React Native 0.85.3 and React 19.2.3. Use Node `20.19.4` or newer. Physical iPhones can only install the latest Expo Go, so keeping the project on the current Expo SDK is required for Expo Go testing.

If npm fails because of a local cache permission issue, install with a project-local cache:

```sh
npm install --cache ./work/npm-cache
```

## Run On iPhone

Create a local `.env` file first:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

```sh
npx expo start -c
```

Then scan the QR code with Expo Go on your iPhone. Use the same Wi-Fi network for the Mac and iPhone.

For a physical iPhone, `127.0.0.1` points at the phone, not the Mac. Use the Mac LAN IP instead:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8000
```

Start Django with `python frapi/manage.py runserver 0.0.0.0:8000` and include the Mac LAN IP in backend `ALLOWED_HOSTS`, or use `ALLOWED_HOSTS=*` only for local testing.

For the complete physical-device proof, follow [IPHONE_BACKEND_TEST.md](IPHONE_BACKEND_TEST.md).

## Run In A Browser

```sh
npm run web
```

The browser preview uses a small `database.web.ts` localStorage fallback so the UI can be inspected locally. iOS and Android still use `expo-sqlite`.

## Debug Data

Open `Settings` in development and use:

- `Test Backend Health` to call `GET /api/health/`.
- `Register Device` to create/update the anonymous device record.
- `Send Test Event` to post a debug analytics event.
- `Show API Base URL` to confirm the app is pointed at the hosted backend.
- `Show Device ID` to inspect the stable anonymous device ID stored on the device.
- `Seed Sample Data` for recently contacted, due soon, overdue, and never-contacted friends.
- `Schedule Debug Notification` for a local notification about 10 seconds later.
- `Log Pending Notifications` to print scheduled notifications to the console.
- `Clear Local Data` to reset SQLite friend/log data and local settings.

## Backend MVP

The app remains local-first with SQLite, but it can now send best-effort MVP data to Django. Backend failures are logged in development and should not block local app actions.

Required backend routes:

- `GET /api/health/`
- `POST /api/devices/`
- `POST /api/friends/`
- `PATCH /api/friends/<id>/`
- `POST /api/friends/<id>/interactions/`
- `DELETE /api/interactions/<id>/`
- `POST /api/events/`

Expected backend setup:

- Local proof-of-concept URL such as `http://127.0.0.1:8000`.
- For hosted testing, a public HTTPS URL.
- Postgres configured with `DATABASE_URL` for hosted deployments.
- Secrets such as `SECRET_KEY`, `DEBUG`, and `ALLOWED_HOSTS` loaded from environment variables.
- CORS enabled for Expo/mobile testing as needed.
- No committed `db.sqlite3` or backend credentials.

The Expo app only stores the backend URL in `EXPO_PUBLIC_API_BASE_URL`. Do not put secrets in Expo public env vars.

## What Is Implemented

- Expo Router navigation.
- SQLite tables for `friends` and `interaction_logs`.
- AsyncStorage settings repository.
- Dashboard counts and priority sections.
- All Friends search and status filter.
- Add, edit, archive, detail, quick mark contacted, log interaction, and delete interaction flows.
- Shared status calculation:
  - no `lastContactedAt`: `neverContacted`
  - `daysSinceLastContact > cadenceDays`: `overdue`
  - `daysSinceLastContact >= ceil(cadenceDays * 0.8)`: `dueSoon`
  - otherwise: `good`
- Local notification permission request from user action.
- Stable friend reminder/debug notification IDs.
- Stable anonymous device ID stored locally.
- Best-effort backend calls for friend create/edit/archive, interaction log/delete, health testing, device registration, and debug events.
- Development-only seed, clear-data, and notification debug tools.

## Intentionally Not Implemented

- No accounts.
- No cloud sync.
- No full auth.
- No two-way sync or conflict resolution.
- No contacts import.
- No iMessage, SMS, call history, WhatsApp, Discord, Messenger, or private communication reading.
- No raw communication metadata from private apps.

Daily summary settings exist in the MVP UI, but the first pass focuses scheduling on friend reminders and debug notifications.

Backend sync is currently one-way and best-effort. There is no retry queue, persistent sync status, authentication, two-way sync, or conflict resolution.

## Manual Test Checklist

1. Launch the app with `npx expo start -c`.
2. Confirm SQLite initializes without errors.
3. Seed sample data from Settings.
4. Confirm dashboard counts look correct.
5. Add, edit, and archive a friend.
6. Search and filter friends.
7. Log an interaction.
8. Delete the latest interaction and confirm `lastContactedAt` recalculates.
9. Request notification permission from Settings.
10. Schedule the debug notification.
11. Confirm backend `/api/health/` opens from the simulator/browser. For iPhone, use the Mac LAN IP.
12. Add `EXPO_PUBLIC_API_BASE_URL` to `.env`.
13. Open Settings and tap `Test Backend Health`.
14. Tap `Register Device` and `Send Test Event`.
15. Add a friend and confirm the backend database receives it.
16. Log an interaction and confirm the backend database receives it.
17. Archive a friend and confirm the backend record updates.
18. Temporarily break the backend URL and confirm local app actions still work.
19. Restart the app and confirm data/settings persist.
