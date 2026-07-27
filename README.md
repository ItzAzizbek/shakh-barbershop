# Shakh Barbershop — booking site

Mobile-first, minimalist booking page (Uzbek / Russian) that sends new bookings straight to a Telegram chat.

## How it works

- `public/` — static frontend: form (full name, phone, date, time 09:00–23:00), language toggle, client-side validation.
- `server.js` — Express server that serves the frontend and exposes `POST /api/book`, which validates the booking and forwards it to Telegram via the Bot API. The bot token stays server-side only.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Create a Telegram bot:
   - Message [@BotFather](https://t.me/BotFather) → `/newbot` → follow the prompts → copy the token it gives you.
3. Get the chat ID that should receive bookings:
   - Send any message to your new bot (or add it to a group/channel).
   - Open `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser and copy the `"chat":{"id": ...}` value.
4. Copy `.env.example` to `.env` and fill in `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
5. Run it:
   ```
   npm start
   ```
   Open http://localhost:3000 (or set `PORT` in `.env`).

## Notes

- Time slots are generated in 30-minute steps between 09:00 and 23:00; adjust `OPEN_HOUR` / `CLOSE_HOUR` in `server.js` and `public/app.js` if hours change.
- Both client and server validate name, phone, date (not in the past), and time (within business hours) — the server is the source of truth.
- `.env` is gitignored; never commit your bot token.
# shakh-barbershop
