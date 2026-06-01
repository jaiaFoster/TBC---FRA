# Friend Reminder

Friend Reminder is a privacy-first Expo + React Native + TypeScript MVP for manually tracking relationship cadence, interaction history, and local reminders.

## Install

```sh
npm install
```

This project was scaffolded with current Expo packages. On this machine, npm warned that the newest React Native/Expo packages prefer Node `20.19.4` or newer while the local Node version is `20.11.1`. If Expo start fails, update Node first.

## Run On iPhone

```sh
npm start
```

Then scan the QR code with Expo Go on your iPhone. Use the same Wi-Fi network for the Mac and iPhone.

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
