# Friend Reminder Backend MVP Patch Guide

The Expo app now supports best-effort calls to a hosted Django backend. Colton's backend repo was not included in this workspace, so these are the backend changes needed to match the mobile app.

## Environment

Add `.env.example` to the backend repo:

```env
SECRET_KEY=replace-me
DEBUG=False
ALLOWED_HOSTS=your-backend-host.example.com
DATABASE_URL=postgres://user:password@host:5432/dbname
CORS_ALLOW_ALL_ORIGINS=True
```

Recommended packages:

```txt
dj-database-url
django-cors-headers
gunicorn
psycopg2-binary
```

Do not commit `db.sqlite3`, `.env`, or database credentials.

## Routes Expected By Mobile

All responses should be JSON.

```text
GET    /api/health/
POST   /api/devices/
POST   /api/friends/
GET    /api/friends/?deviceId=<uuid>
PATCH  /api/friends/<id>/
POST   /api/friends/<id>/interactions/
GET    /api/friends/<id>/interactions/
DELETE /api/interactions/<id>/
POST   /api/events/
```

Suggested response shape:

```json
{ "ok": true, "data": {} }
```

or:

```json
{ "ok": false, "error": "Friend not found" }
```

## Health Endpoint

`GET /api/health/` should return:

```json
{
  "ok": true,
  "service": "friend-reminder-backend"
}
```

## Models

Use UUID primary keys for new MVP tables if practical:

- `Device`
- `Friend`
- `InteractionLog`
- `AppEvent`

The mobile app sends both camelCase and snake_case fields for the first backend pass, so Django can accept either form while the API stabilizes.

## Privacy Boundary

The backend should only store manually entered MVP data:

- anonymous device ID
- friend name and notes manually entered by the tester
- cadence and preferred interaction type
- manual interaction timestamp/type/notes
- debug/product events

Do not collect messages, SMS, call history, WhatsApp, Discord, Messenger, contacts import, or private communication metadata.
