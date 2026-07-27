require('dotenv').config();
const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const OPEN_HOUR = 9;
const CLOSE_HOUR = 23;
const PHONE_RE = /^\+?\d{7,15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):(00|30)$/;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function isWithinHours(time) {
  const [h] = time.split(':').map(Number);
  return h >= OPEN_HOUR && h <= CLOSE_HOUR;
}

function isTodayOrFuture(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const picked = new Date(dateStr + 'T00:00:00');
  return picked.getTime() >= today.getTime();
}

app.post('/api/book', async (req, res) => {
  const { name, phone, date, time } = req.body || {};

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return res.status(400).json({ ok: false, error: 'invalid_name' });
  }
  if (typeof phone !== 'string' || !PHONE_RE.test(phone.trim())) {
    return res.status(400).json({ ok: false, error: 'invalid_phone' });
  }
  if (typeof date !== 'string' || !DATE_RE.test(date) || !isTodayOrFuture(date)) {
    return res.status(400).json({ ok: false, error: 'invalid_date' });
  }
  if (typeof time !== 'string' || !TIME_RE.test(time) || !isWithinHours(time)) {
    return res.status(400).json({ ok: false, error: 'invalid_time' });
  }

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Telegram is not configured: set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env');
    return res.status(500).json({ ok: false, error: 'telegram_not_configured' });
  }

  const cleanName = name.trim();
  const cleanPhone = phone.trim();

  const text =
    `🆕 Yangi buyurtma / Новая запись — Shakh Barbershop\n\n` +
    `👤 Ism / Имя: ${cleanName}\n` +
    `📞 Telefon / Телефон: ${cleanPhone}\n` +
    `📅 Sana / Дата: ${date}\n` +
    `⏰ Vaqt / Время: ${time}`;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error('Telegram API error:', tgData);
      return res.status(502).json({ ok: false, error: 'telegram_send_failed' });
    }
  } catch (err) {
    console.error('Failed to reach Telegram API:', err);
    return res.status(502).json({ ok: false, error: 'telegram_unreachable' });
  }

  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`shath.kh booking server running on http://localhost:${PORT}`);
});
