# Physical iPhone Backend Proof

This test proves:

```text
Expo app on iPhone -> Django on Mac -> backend SQLite database
```

## 1. Start The Backend

In the backend repo:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python frapi/manage.py migrate
DEBUG=True ALLOWED_HOSTS=* CORS_ALLOW_ALL_ORIGINS=True python frapi/manage.py runserver 0.0.0.0:8000
```

Keep this terminal running.

## 2. Find The Mac LAN IP

```sh
ipconfig getifaddr en0
```

If that prints nothing, try:

```sh
ipconfig getifaddr en1
```

The Mac and iPhone must be on the same Wi-Fi network.

## 3. Configure The Frontend

Create `.env` in the frontend repo using the Mac LAN IP:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_MAC_IP:8000
```

Do not use `127.0.0.1` for a physical iPhone. On the phone, it points back to the phone.

## 4. Start Expo

```sh
npm install
npx expo start -c
```

Open the project in Expo Go.

## 5. Run The Proof

1. Open `http://YOUR_MAC_IP:8000/api/health/` in iPhone Safari.
2. Confirm the JSON response has `"ok": true`.
3. In the app, open Settings.
4. Tap `Show API Base URL` and confirm the Mac LAN IP.
5. Tap `Show Device ID`.
6. Tap `Test Backend Health` and confirm success.
7. Tap `Register Device`.
8. Tap `Send Test Event`.
9. Add a friend.
10. Log an interaction for that friend.
11. Confirm Django logs the requests.
12. Stop Django.
13. Add another friend.
14. Confirm the friend still appears locally and the app does not crash.

## Known Limitations

- Sync is one-way and best-effort; there is no retry queue.
- Backend failures are logged but not shown as a persistent sync status.
- There is no authentication or conflict resolution.
- Existing local records are not automatically backfilled to the backend.
- HTTP LAN testing is for local proof only; hosted deployments should use HTTPS.
