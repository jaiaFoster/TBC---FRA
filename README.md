# Friend Reminder

Friend Reminder is a privacy-first Expo + React Native + TypeScript MVP for manually tracking relationship cadence, interaction history, and local reminders.

## Install

```sh
npm install
```

The project is pinned to Expo SDK 52 with React Native 0.76.9 and React 18.3.1. The original upload used `"latest"` dependency ranges, which can pull newer Expo/React Native versions that require Node `20.19.4+`. These pinned versions were verified locally on Node `20.11.1`.

If npm fails because of a local cache permission issue, install with a project-local cache:

```sh
npm install --cache ./work/npm-cache
```

## Run On iPhone

```sh
npm start
```

Then scan the QR code with Expo Go on your iPhone. Use the same Wi-Fi network for the Mac and iPhone.

## Run In A Browser

```sh
npm run web
```

The browser preview uses a small `database.web.ts` localStorage fallback so the UI can be inspected locally. iOS and Android still use `expo-sqlite`.

## Debug Data

Open `Settings` in development and use:

- `Seed Sample Data` for recently contacted, due soon, overdue, and never-contacted friends.
- `Schedule Debug Notification` for a local notification about 10 seconds later.
- `Log Pending Notifications` to print scheduled notifications to the console.
- `Clear Local Data` to reset SQLite friend/log data and local settings.

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
- Development-only seed, clear-data, and notification debug tools.

## Intentionally Not Implemented

- No backend.
- No accounts.
- No cloud sync.
- No contacts import.
- No iMessage, SMS, call history, WhatsApp, Discord, Messenger, or private communication reading.
- No raw communication metadata from private apps.

Daily summary settings exist in the MVP UI, but the first pass focuses scheduling on friend reminders and debug notifications.

## Manual Test Checklist

1. Launch the app with `npm start`.
2. Confirm SQLite initializes without errors.
3. Seed sample data from Settings.
4. Confirm dashboard counts look correct.
5. Add, edit, and archive a friend.
6. Search and filter friends.
7. Log an interaction.
8. Delete the latest interaction and confirm `lastContactedAt` recalculates.
9. Request notification permission from Settings.
10. Schedule the debug notification.
11. Restart the app and confirm data/settings persist.
