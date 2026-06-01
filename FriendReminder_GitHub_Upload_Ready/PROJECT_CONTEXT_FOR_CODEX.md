# Friend Reminder — Codex Project Context

## 1. Project identity

Project name: Friend Reminder

Product concept:
Friend Reminder is a privacy-first relationship maintenance app. It helps users remember to stay in touch with important people by letting them manually add friends, set contact cadences, log interactions, and receive reminders when relationships are drifting.

This project was originally explored as a SwiftUI iOS-only app, but the implementation direction has changed.

Current implementation target:
React Native + Expo + TypeScript.

Reason for pivot:
The team wants a cross-platform codebase that can eventually support iOS and Android, while still testing the MVP on iPhone from a Mac.

## 2. Non-negotiable MVP constraints

The MVP must be privacy-first and local-first.

Do not implement:
- No backend.
- No account system.
- No cloud sync.
- No iMessage reading.
- No SMS reading.
- No call-history reading.
- No WhatsApp reading.
- No Discord reading.
- No Messenger reading.
- No private message content.
- No scraping of communication apps.
- No raw communication metadata from private apps.

The MVP should only track user-entered relationship metadata:
- Friend name.
- Notes.
- Cadence.
- Last contacted date.
- Preferred interaction type.
- Manual interaction logs.
- Reminder/settings state.

Contacts import may be considered later, but do not implement it in this first MVP unless explicitly requested.

## 3. Target stack

Use:
- Expo
- React Native
- TypeScript
- expo-router for file-based navigation
- expo-sqlite for local database persistence
- expo-notifications for local reminders
- AsyncStorage for lightweight app settings, if needed
- Functional React components
- Clear, readable, debug-friendly code

Avoid:
- Native iOS Swift files unless absolutely required.
- Native Android Kotlin/Java files unless absolutely required.
- Backend services.
- Firebase/Supabase/cloud sync for MVP.
- Overly abstract architecture.
- Complex state libraries unless clearly justified.

Preferred project style:
- Simple enough for a small startup team.
- Easy to test on an iPhone.
- Easy to hand off to another developer.
- Verbose enough comments for human understanding.
- Debug-friendly logs and seed data.

## 4. Development environment assumption

User is on a Mac and wants to test on iPhone.

Recommended local workflow:
- Create/start Expo app.
- Use Expo Go or a development build as appropriate.
- Use iPhone for testing.
- Keep native dependencies compatible with Expo-managed workflow when possible.

## 5. Core app entities

### Friend

```ts
export type Friend = {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  lastContactedAt: string | null;
  cadenceDays: number;
  preferredInteractionType: InteractionType;
  isArchived: boolean;
};
```

### InteractionLog

```ts
export type InteractionLog = {
  id: string;
  friendId: string;
  interactionType: InteractionType;
  date: string;
  notes: string;
  createdAt: string;
};
```

### InteractionType

```ts
export type InteractionType = "texted" | "called" | "hungOut" | "other";
```

### FriendStatus

```ts
export type FriendStatus = "good" | "dueSoon" | "overdue" | "neverContacted";
```

## 6. Relationship status logic

Use one shared status calculator everywhere.

Rules:
- If `lastContactedAt` is null: `neverContacted`
- If `daysSinceLastContact > cadenceDays`: `overdue`
- If `daysSinceLastContact >= ceil(cadenceDays * 0.8)`: `dueSoon`
- Otherwise: `good`

Important example:
- cadenceDays = 14
- dueSoonThreshold = ceil(14 * 0.8) = 12
- day 12, 13, 14 = dueSoon
- day 15+ = overdue

Do not duplicate this logic inside views.

## 7. Local persistence

Use SQLite for core data.

Suggested tables:

```sql
CREATE TABLE IF NOT EXISTS friends (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL,
  lastContactedAt TEXT,
  cadenceDays INTEGER NOT NULL,
  preferredInteractionType TEXT NOT NULL,
  isArchived INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS interaction_logs (
  id TEXT PRIMARY KEY NOT NULL,
  friendId TEXT NOT NULL,
  interactionType TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  createdAt TEXT NOT NULL,
  FOREIGN KEY(friendId) REFERENCES friends(id) ON DELETE CASCADE
);
```

Store dates as ISO strings.

Settings may be stored in AsyncStorage:
- notificationsEnabled
- notifyBeforeDue
- daysBeforeDue
- dailySummaryEnabled
- dailySummaryHour
- defaultCadenceDays

## 8. Required app screens

Use expo-router file-based routing.

Suggested routes:

```text
app/
  _layout.tsx
  index.tsx                       Dashboard
  friends/
    index.tsx                     All friends/search/filter
    add.tsx                       Add friend
    [id].tsx                      Friend detail
    [id]/edit.tsx                 Edit friend
    [id]/log.tsx                  Log interaction
  settings.tsx                    Settings
  privacy.tsx                     Privacy explanation
```

## 9. Required features for first React Native MVP

### Dashboard
- Summary counts: total active friends, overdue, due soon, never contacted.
- Priority sections: overdue, never contacted, due soon.
- Recently contacted section.
- Link to All Friends.
- Link to Settings.
- Add Friend button.

### All Friends
- Search by name.
- Filter by status: all, overdue, never contacted, due soon, good.
- Rows show initials, name, last-contacted text, cadence, and status badge.

### Add Friend
- Name, notes, cadence, preferred interaction type.
- Optional toggle: set last contacted to today.
- If set to today, create an initial interaction log.

### Edit Friend
- Edit name, notes, cadence, preferred interaction type.
- Reschedule reminders if needed.

### Friend Detail
- Show current status, last contacted text, cadence, preferred interaction type, notes.
- Actions: Log Interaction, Quick Mark Contacted Today, Edit Friend, Archive Friend.
- Interaction history newest-first.
- Allow deleting an interaction log.
- If deleting the latest interaction, recalculate lastContactedAt from remaining logs.
- If no logs remain, set lastContactedAt to null.

### Log Interaction
- Interaction type, date picker, optional note.
- Save creates InteractionLog.
- Save updates Friend.lastContactedAt only if log date is newer than current value.
- Save reschedules reminders if reminders are enabled.

### Settings
- Notification permission status/request.
- Enable/disable reminders.
- Notify before due toggle.
- Days before due.
- Daily summary toggle.
- Daily summary hour.
- Default cadence.
- Privacy details link.
- Debug utilities in development mode.

### Privacy
Include clear copy:
Friend Reminder does not read your messages, calls, or private communication history. All MVP data is manually entered and stored locally on your device. The MVP has no backend, no accounts, and no cloud sync.

## 10. Notifications

Use local notifications only.

Notification behavior:
- Ask notification permission from a user action, not automatically on launch.
- Schedule friend reminder at 9:00 AM local time on due date.
- Optional before-due notification.
- Optional daily summary notification.
- Cancel notifications when a friend is archived or deleted.
- Reschedule notifications when friend cadence, settings, or interaction history changes.

Use stable notification IDs:
- friend reminder: `friendReminder.friend.<friendId>.overdue`
- before due: `friendReminder.friend.<friendId>.beforeDue`
- daily summary: `friendReminder.dailySummary`
- debug notification: `friendReminder.debug.test`

## 11. Debug requirements

Include debug-friendly utilities:
- `debugLogger.ts`
- `debugSeedService.ts`
- Development-only debug menu or debug section.
- Seed sample friends:
  - recently contacted
  - due soon
  - overdue
  - never contacted
- Include sample interaction logs.
- Clear all local data.
- Schedule debug notification 10 seconds in the future.
- Log pending notifications if available.
- Verbose console logs around persistence and reminder scheduling.

Keep debug tools hidden or clearly development-only.

## 12. Suggested source structure

```text
src/
  components/
    DashboardSummary.tsx
    EmptyState.tsx
    FriendRow.tsx
    StatusBadge.tsx
  db/
    database.ts
    migrations.ts
  debug/
    debugLogger.ts
    debugSeedService.ts
  models/
    friend.ts
    interactionLog.ts
    friendStatus.ts
  repositories/
    friendRepository.ts
    interactionLogRepository.ts
    settingsRepository.ts
  services/
    friendStatusService.ts
    interactionLogService.ts
    notificationService.ts
    reminderScheduler.ts
  theme/
    spacing.ts
    typography.ts
  utils/
    dateUtils.ts
```

## 13. Coding style

Use:
- TypeScript strictness where possible.
- Human-readable comments.
- Full-file clarity over clever abstractions.
- Small service files.
- Clear error handling.
- Debug logs around operations that can fail.
- Simple UI first.

Avoid:
- Huge monolithic files.
- Overengineering.
- Implicit magic.
- Silent failures.
- Premature cloud/backend code.
- Private communication access.

## 14. Testing requirements

Add pure TypeScript unit tests if practical for:
- status calculation
- due date calculation
- before-due date calculation
- interaction deletion recalculation

At minimum, make these functions pure and easy to test manually.

Manual test checklist:
1. App launches.
2. Database initializes.
3. Seed sample data.
4. Dashboard counts are correct.
5. Add friend.
6. Edit friend.
7. Archive friend.
8. Search friends.
9. Filter friends.
10. Log interaction.
11. Delete interaction.
12. Recalculate lastContactedAt.
13. Enable reminders.
14. Schedule debug notification.
15. Restart app and confirm persistence.
16. Settings persist.

## 15. Current roadmap status after pivot

```text
FRIEND REMINDER MVP ROADMAP
│
├── 0. Project Rules / Constraints              [DEFINED]
├── 1. React Native + Expo Project Setup        [NEXT]
├── 2. Local SQLite Data Foundation             [NEXT]
├── 3. Interaction Logging                      [NEXT]
├── 4. Dashboard + Search                       [NEXT]
├── 5. Local Notifications                      [NEXT]
├── 6. Settings + Privacy                       [NEXT]
├── 7. UI Polish                                [NOT STARTED]
├── 8. QA + iPhone/TestFlight Prep              [NOT STARTED]
└── 9. Founder Feedback Iteration               [NOT STARTED]
```

## 16. Definition of done for Codex first pass

The first Codex implementation is successful when:
- The Expo app starts.
- The project uses TypeScript.
- Core local SQLite tables initialize.
- User can add/edit/archive friends.
- User can log/delete interactions.
- Dashboard status counts work.
- All Friends search/filter works.
- Settings/privacy screens exist.
- Local notification permission and debug notification exist.
- Debug seed and clear-data flows exist.
- Code is readable and ready for iPhone testing.
