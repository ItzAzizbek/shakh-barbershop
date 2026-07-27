# Shakh Barbershop — booking site

Mobile-first, minimalist booking page (Uzbek / Russian). New bookings are sent straight to a Telegram chat via a direct call to the Telegram Bot API from the browser — this is a pure static site, no backend.

## How it works

- `public/index.html`, `public/styles.css`, `public/app.js` — the entire site.
- On submit, `public/app.js` calls `https://api.telegram.org/bot<TOKEN>/sendMessage` directly with the booking details.

## ⚠️ Bot token is public

The Telegram bot token lives in `public/app.js` and ships to every visitor's browser. Anyone who opens dev tools can read it and use your bot to send messages. Acceptable for a low-stakes booking notifier, but:
- Don't reuse this bot/token for anything more sensitive.
- If it's ever abused, regenerate the token via [@BotFather](https://t.me/BotFather) → `/revoke` and update `public/app.js`.

## Run locally

```
npm run dev
```

Opens a static server at http://localhost:3000 (via `serve`).

## Deploy (Netlify)

`netlify.toml` already points Netlify at the `public/` folder as the publish directory, so a plain "deploy this repo" works with no build command needed.

## Notes

- Time slots: 30-minute steps between 09:00 and 23:00 — adjust `OPEN_HOUR` / `CLOSE_HOUR` in `public/app.js`.
- All validation (name, phone, date, time) is client-side only, since there's no backend.
