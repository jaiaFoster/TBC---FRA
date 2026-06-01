You are working on Friend Reminder, a privacy-first relationship maintenance mobile app.

Important context:
- The app was originally explored in SwiftUI, but the implementation must now be React Native + Expo + TypeScript.
- The user is on a Mac and will test on iPhone.
- The eventual goal is cross-platform iOS + Android.
- Do not use SwiftUI.
- Do not create native Swift/Kotlin code unless absolutely necessary.
- Build with Expo-managed workflow where possible.

Your job:
Create or refactor the project into a working Expo + React Native + TypeScript MVP for Friend Reminder.

Read the attached/project file `PROJECT_CONTEXT_FOR_CODEX.md` first and treat it as the source of truth.

Core requirements:
1. Use Expo + React Native + TypeScript.
2. Use expo-router for navigation.
3. Use expo-sqlite for local persistence.
4. Use expo-notifications for local notifications.
5. Use AsyncStorage or a simple local settings repository for settings.
6. No backend.
7. No cloud sync.
8. No accounts.
9. No private communication access.
10. No iMessage/SMS/call-history/WhatsApp/Discord/Messenger reading.
11. Only user-entered relationship metadata.

Implement the MVP screens:
- Dashboard
- All Friends / Search / Filter
- Add Friend
- Edit Friend
- Friend Detail
- Log Interaction
- Settings
- Privacy

Implement the MVP data model:
- Friend
- InteractionLog
- InteractionType
- FriendStatus

Implement core services:
- SQLite database initialization/migrations
- friendRepository
- interactionLogRepository
- settingsRepository
- friendStatusService
- interactionLogService
- notificationService
- reminderScheduler
- debugLogger
- debugSeedService

Relationship status rules:
- lastContactedAt null => neverContacted
- daysSinceLastContact > cadenceDays => overdue
- daysSinceLastContact >= ceil(cadenceDays * 0.8) => dueSoon
- otherwise => good

Interaction behavior:
- Logging an interaction creates an InteractionLog.
- If the interaction date is newer than Friend.lastContactedAt, update Friend.lastContactedAt.
- Deleting an interaction must recalculate Friend.lastContactedAt from remaining logs.
- If no logs remain, set Friend.lastContactedAt to null.

Notification behavior:
- Ask notification permission from a user action.
- Schedule local friend reminders only.
- Reminder IDs:
  - friendReminder.friend.<friendId>.overdue
  - friendReminder.friend.<friendId>.beforeDue
  - friendReminder.dailySummary
  - friendReminder.debug.test
- Cancel reminders when a friend is archived or deleted.
- Reschedule reminders when cadence, settings, or interaction history changes.
- Include a debug notification scheduled 10 seconds in the future.

Debug requirements:
- Add a debug menu or debug section available in development.
- Seed sample friends:
  - recently contacted
  - due soon
  - overdue
  - never contacted
- Include sample interaction logs.
- Add clear all local data.
- Add verbose logs around DB operations, interaction logging, and notification scheduling.

Implementation style:
- Keep files readable.
- Prefer clear comments over clever code.
- Avoid giant components.
- Use small service/repository files.
- Make pure date/status functions easy to test.
- Use full, working code rather than pseudo-code.
- If you need to make assumptions, document them in `README.md`.

Suggested folder structure:
```text
app/
  _layout.tsx
  index.tsx
  friends/
    index.tsx
    add.tsx
    [id].tsx
    [id]/edit.tsx
    [id]/log.tsx
  settings.tsx
  privacy.tsx

src/
  components/
  db/
  debug/
  models/
  repositories/
  services/
  theme/
  utils/
```

After implementation:
1. Run dependency install if needed.
2. Run typecheck/lint if configured.
3. Fix all TypeScript errors.
4. Add or update README with:
   - how to install
   - how to run on iPhone
   - how to seed debug data
   - what is intentionally not implemented
5. Summarize:
   - files created
   - key architecture decisions
   - anything that needs manual iPhone testing
   - known limitations

Do not implement contacts import, backend sync, authentication, or message-reading features in this pass.
